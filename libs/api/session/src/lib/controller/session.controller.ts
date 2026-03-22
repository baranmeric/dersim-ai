import { Request, Response, NextFunction } from 'express';
import SessionService from '../service/session.service';
import { Http } from '@dersim/api-cache';

const SessionController = {
    async createSession(req: Request, res: Response, next: NextFunction) {
        Http.respond(req, res, next, SessionService.createSession(req.userId!));
    },

    async deleteSession(req: Request, res: Response, next: NextFunction) {
        Http.respond(req, res, next, SessionService.safeDeleteSession(req.userId, req.params.id));
    },

    async getUserSessions(req: Request, res: Response, next: NextFunction) {
        Http.respond(req, res, next, SessionService.getUserSessions(req.userId!));
    },

    async getSessionDto(req: Request, res: Response, next: NextFunction) {
        Http.respond(req, res, next, SessionService.getSafeSessionDtoById(req.userId, req.params.id));
    },

    async getAllSessions(req: Request, res: Response, next: NextFunction) {
        Http.respond(req, res, next, SessionService.getAllSessions());
    },

    async resetContextWindow(req: Request, res: Response, next: NextFunction) {
        Http.respond(req, res, next, SessionService.resetContextWindow(req.params.id));
    },
};

export default SessionController;
