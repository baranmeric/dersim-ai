import { Request, Response, NextFunction } from 'express';
import Http from "../helper/http";
import ChatService from '../service/chat.service';

const validateRequest = (req: Request): { stream: boolean, userId: string, sessionId: string, content: string } => {
    const userId = req.userId!;
    const sessionId = req.params.id;
    const stream = req.query.stream === 'true';
    const { content } = req.body;
    return { stream, userId, sessionId, content };
}

export const ChatController = {
    async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { stream, sessionId, content } = validateRequest(req);
        if(stream) {
            try {
                await ChatService.streamChatMessage(res, sessionId, content);
            } catch (error) {
                next(error);
            }
        } else {
            Http.respond(req, res, next, ChatService.generateChatMessage(sessionId, content));
        }
    },
}
