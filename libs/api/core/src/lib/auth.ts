import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { isPublicRoute } from './config/routerConfig';
import { ForbiddenError, UnauthorizedError } from '@dersim/shared';
import config from './config/environmentConfig';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            userId: string;
        }
    }
}

export const getUserIdFromToken = (token: string): string => {
    const decoded = verifyToken(token);
    if (!decoded.id || typeof decoded.id !== 'string') {
        throw new UnauthorizedError('Invalid token payload');
    }
    return decoded.id;
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.userId !== 'admin') {
        next(new ForbiddenError('Admin access required'));
        return;
    }
    next();
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    if (isPublicRoute(req)) {
        next();
        return;
    }
    if (config.admin_secret && req.headers.authorization === `Bearer ${config.admin_secret}`) {
        req.userId = 'admin';
        next();
        return;
    }
    const token = req.cookies.token;
    if (!token) {
        next(new UnauthorizedError('Authentication token is required'));
        return;
    }

    try {
        req.userId = getUserIdFromToken(token);
    } catch (err) {
        next(err);
        return;
    }
    next();
};
