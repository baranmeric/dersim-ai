import { Request, Response, NextFunction } from 'express';
import { Http } from '@dersim/api/cache';
import { InternalError, UnauthorizedError, IAuthData, IUserRequest } from '@dersim/shared';
import UserService from '../service/user.service';

const setCookie = (req: Request, res: Response, next: NextFunction, auth: IAuthData) => {
    const token = auth?.token;
    const user = auth?.user;
    if (!token) {
        next(new InternalError('Token could not be generated'));
        return;
    }
    if (!user) {
        next(new InternalError('User could not be created'));
        return;
    }
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
    });
    Http.respondWithSuccess(res, user);
};

const UserController = {
    async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        Http.respond(req, res, next, UserService.getUserById(req.userId));
    },

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        Http.respond(req, res, next, UserService.getAllUsers());
    },

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        Http.respond(req, res, next, UserService.getUserById(req.params.id));
    },

    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        Http.respond(req, res, next, UserService.deleteUser(req.params.id));
    },

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userRequest: IUserRequest = req.body;
        try {
            const response = await UserService.createUser(userRequest);
            setCookie(req, res, next, response);
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const loginRequest: IUserRequest = req.body;
        try {
            const response = await UserService.login(loginRequest);
            setCookie(req, res, next, response);
        } catch (error) {
            next(error);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        res.clearCookie('token');
        Http.respondWithSuccess(res, { message: 'Logged out successfully' });
    },

    async status(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userId = req.userId;
        if (!userId) {
            next(new UnauthorizedError('Could not fetch user id from token. Please login again.'));
            return;
        }
        Http.respond(req, res, next, UserService.getUserById(userId));
    },
};

export default UserController;
