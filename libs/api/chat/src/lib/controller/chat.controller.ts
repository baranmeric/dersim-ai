import { Request, Response, NextFunction } from 'express';
import { Http } from '@dersim/api-cache';
import ChatService from '../service/chat.service';

const validateRequest = (req: Request) => ({
    stream: req.query.stream === 'true',
    sessionId: req.params.id,
    content: req.body.content as string,
});

export const ChatController = {
    async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { stream, sessionId, content } = validateRequest(req);
        if (stream) {
            try {
                await ChatService.streamChatMessage(res, sessionId, content);
            } catch (error) {
                next(error);
            }
        } else {
            Http.respond(req, res, next, ChatService.generateChatMessage(sessionId, content));
        }
    },
};
