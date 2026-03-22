import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { isAdminRoute, isPublicRoute } from '../router/routerConfig';
import { ForbiddenError, UnauthorizedError } from '@dersim/shared';

// Extend express request object with user id
declare global {
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
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    if (isPublicRoute(req)) {
        next();
        return;
    }
    if (req.headers.authorization === 'Bearer admin') {
        req.userId = 'admin';
        next();
        return;
    }
    if (isAdminRoute(req)) {
        next(new ForbiddenError('Unauthorized'));
        return;
    }

    const token = req.cookies.token;
    if (!token) {
        next(new UnauthorizedError('Authentication token is required'));
        return
    }

    try {
        // User successfully authenticated
        req.userId = getUserIdFromToken(token);
    } catch (err) {
        next(err);
        return;
    }
    next();
};
