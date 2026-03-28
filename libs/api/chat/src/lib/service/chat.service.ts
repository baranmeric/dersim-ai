import { IMessage, MessageRole, AiError } from '@dersim/shared';
import { Response } from "express";
import SessionService, { QueueService } from '@dersim/api-session';
import { AiService } from '@dersim/api-core';
import type { ISession } from '@dersim/api-session';

function buildConversationStack(session: ISession, activeQuery: IMessage): IMessage[] {
    const messages: IMessage[] = [];
    messages.push({
        role: MessageRole.SYSTEM,
        content: `Some rules:
            - Your name is DersimAi
            - You are a custom cloud hosted open model LLM based on Qwen3 and developed by a dev called Baran
            - Structure your responses well
            - Be more factual than emotional and avoid exaggeration
            - Avoid emojis
            - Else, behave like normal`,
    });
    if (session.context?.condensed?.length) messages.push(...session.context.condensed);
    if (session.context?.immediate?.length) messages.push(...session.context.immediate);
    messages.push(activeQuery);
    return messages;
}

const ChatService = {
    async generateChatMessage(sessionId: string, content: string): Promise<IMessage> {
        const session = await SessionService.getSessionById(sessionId);
        const userMessage: IMessage = { role: MessageRole.USER, content };
        await SessionService.pushDisplayMessage(sessionId, userMessage);
        const aiMessage = await this.generateModelResponseMessage(session, userMessage);
        await SessionService.pushDisplayMessage(sessionId, aiMessage);
        QueueService.tryEnqueueSessionTask(session);
        return aiMessage;
    },

    async generateModelResponseMessage(session: ISession, activeQuery: IMessage): Promise<IMessage> {
        const conversationStack = buildConversationStack(session, activeQuery);
        const response = await AiService.generateContent(conversationStack);
        return this.createAssistantMessage(response);
    },

    async streamChatMessage(res: Response, sessionId: string, content: string) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        let session = await SessionService.getSessionById(sessionId);
        const userMessage: IMessage = { role: MessageRole.USER, content };
        await SessionService.pushDisplayMessage(sessionId, userMessage);

        const conversationStack = buildConversationStack(session, userMessage);
        let aiResponse = '';

        await AiService.streamContent(conversationStack, {
            onChunk: (chunk: string) => {
                if (chunk) { res.write(chunk); aiResponse += chunk; }
            },
            onDone: () => { res.end(); },
            onError: (error: AiError) => { throw error; }
        });

        if (!aiResponse || aiResponse.length === 0) return;

        const aiMessage = this.createAssistantMessage(aiResponse);
        session = await SessionService.pushDisplayMessage(sessionId, aiMessage);
        QueueService.tryEnqueueSessionTask(session);
    },

    createAssistantMessage(content: string): IMessage {
        return { role: MessageRole.ASSISTANT, content };
    },
};

export default ChatService;
