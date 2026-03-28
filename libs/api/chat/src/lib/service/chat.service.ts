import { IMessage, MessageRole, AiError } from '@dersim/shared';
import { Response } from "express";
import SessionService, { messageBuilder, QueueService } from '@dersim/api-session';
import { AiService } from '@dersim/api-core';
import type { ISession } from '@dersim/api-session';

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
        const conversationStack = await messageBuilder.buildConversationStack(session, activeQuery);
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

        const conversationStack = await messageBuilder.buildConversationStack(session, userMessage);
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
