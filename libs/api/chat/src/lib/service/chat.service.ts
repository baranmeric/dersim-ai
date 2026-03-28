import { IMessage, MessageRole, AiError } from '@dersim/shared';
import { Response } from "express";
import SessionService, { QueueService } from '@dersim/api/session';
import { Ai } from '@dersim/api/core';
import type { ISession } from '@dersim/api/session';

const ChatService = {
    // No Stream
    async generateChatMessage(sessionId: string, content: string): Promise<IMessage> {
        // Get session and update with user message
        const session = await SessionService.getSessionById(sessionId);
        const userMessage: IMessage = { role: MessageRole.USER, content };
        await SessionService.pushDisplayMessage(sessionId, userMessage);

        // Generate AI response
        const conversationStack = this.buildConversationStack(session, userMessage);
        const response = await Ai.generateContent(conversationStack);
        const aiMessage = this.createAssistantMessage(response);

        // Update session
        await SessionService.pushDisplayMessage(sessionId, aiMessage);
        QueueService.tryEnqueueSessionTask(session);
        return aiMessage;
    },

    // Stream
    async streamChatMessage(res: Response, sessionId: string, content: string) {
        // Set stream headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Get session and update with user message
        let session = await SessionService.getSessionById(sessionId);
        const userMessage: IMessage = { role: MessageRole.USER, content };
        await SessionService.pushDisplayMessage(sessionId, userMessage);

        // Generate AI Response
        const conversationStack = this.buildConversationStack(session, userMessage);
        let aiResponse = '';

        await Ai.streamContent(conversationStack, {
            onChunk: (chunk: string) => {
                if (chunk) { res.write(chunk); aiResponse += chunk; }
            },
            onDone: () => { res.end(); },
            onError: (error: AiError) => { throw error; }
        });

        if (!aiResponse || aiResponse.length === 0) return;

        // Update session
        const aiMessage = this.createAssistantMessage(aiResponse);
        session = await SessionService.pushDisplayMessage(sessionId, aiMessage);
        QueueService.tryEnqueueSessionTask(session);
    },

    // Helper functions

    createAssistantMessage(content: string): IMessage {
        return { role: MessageRole.ASSISTANT, content };
    },

    buildConversationStack(session: ISession, activeQuery: IMessage): IMessage[] {
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
};

export default ChatService;
