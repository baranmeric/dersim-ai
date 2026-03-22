import SessionService from "../service/session.service";
import { Request, Response, NextFunction } from 'express';
import http from "../helper/http";

const SessionController = {
    // Client routes
    async createSession(req: Request, res: Response, next: NextFunction) {
        http.respond(req, res, next, SessionService.createSession(req.userId!));
    },

    async deleteSession(req: Request, res: Response, next: NextFunction) {
        http.respond(req, res, next, SessionService.safeDeleteSession(req.userId, req.params.id));
    },

    async getUserSessions(req: Request, res: Response, next: NextFunction) {
        const userId = req.userId!;
        http.respond(req, res, next, SessionService.getUserSessions(userId));
    },

    async getSessionDto(req: Request, res: Response, next: NextFunction) {
        http.respond(req, res, next, SessionService.getSafeSessionDtoById(req.userId, req.params.id));
    },

    // Admin routes
    async getAllSessions(req: Request, res: Response, next: NextFunction) {
        http.respond(req, res, next, SessionService.getAllSessions());
    },

    async resetContextWindow(req: Request, res: Response, next: NextFunction) {
        http.respond(req, res, next, SessionService.resetContextWindow(req.params.id))
    },
}

export default SessionController
