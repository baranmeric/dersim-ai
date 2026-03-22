import { Request, Response, NextFunction } from 'express';
import UserService from '../service/user.service';
import http from '../helper/http';
import { InternalError, UnauthorizedError } from '@dersim/shared';
import { IAuthData, IUserRequest } from '@dersim/shared';


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
    // Set http cookie
    res.cookie('token', token, {
        httpOnly: true, // Prevents JS to access cookie
        secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin
        maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
    })
    http.respondWithSuccess(res, user);
}

const UserController = {
    async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        http.respond(req, res, next, UserService.getUserById(req.userId));
    },

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        http.respond(req, res, next, UserService.getAllUsers());
    },

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        http.respond(req, res, next, UserService.getUserById(req.params.id));
    },

    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        http.respond(req, res, next, UserService.deleteUser(req.params.id));
    },

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userRequest: IUserRequest = req.body;
        try {
            const response = await UserService.createUser(userRequest);
            setCookie(req, res, next, response);
        } catch(error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const loginRequest: IUserRequest = req.body;
        try {
            const response = await UserService.login(loginRequest);
            setCookie(req, res, next, response);
        } catch(error) {
            next(error);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        res.clearCookie('token');
        http.respondWithSuccess(res, { message: 'Logged out successfully' });
    },

    // Get user with just the jwt token in cookie, for bootstrapping
    async status(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userId = req.userId;
        if (!userId) {
            const error = new UnauthorizedError('Could not fetch user id from token. Please login again.');
            next(error);
            return;
        }
        http.respond(req, res, next, UserService.getUserById(userId));
    },
}

export default UserController;
