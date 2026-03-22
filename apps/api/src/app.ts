import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
// Routers
import userRouter from './router/user.router';
import chatRouter from './router/chat.router';
import sessionRouter from "./router/session.router";
import cacheRouter from './router/cache.router';
// Custom middleware
import { authenticate } from "./middleware/auth";
import { errorHandler, notFoundHandler } from './error/errorHandler';
import { BaseRoute } from '@dersim/shared';

const cookieParser = require('cookie-parser');
const app: Application = express();

morgan.token('response-body', (req: Request, res: any) => {
    if (res.statusCode >= 400 && res._responseBody) {
        try {
            const body = typeof res._responseBody === 'string'
                ? JSON.parse(res._responseBody)
                : res._responseBody;
            if (body && !body.success) {
                return JSON.stringify(body);
            }
        } catch (e) {
            return JSON.stringify(res._responseBody);
        }
    }
    return 'completed with success';
});

app.use((req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body?: any): Response {
        // Save the response body for logging
        (res as any)._responseBody = body;
        return originalSend.call(this, body);
    };

    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logging format including response body for errors
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :response-body'));

app.use(helmet());
app.use(cookieParser());

const corsOptions: cors.CorsOptions = {
    origin: ['http://localhost:4200', 'http://localhost:3000', 'https://dersim-ai.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
    exposedHeaders: ['Content-Type', 'Transfer-Encoding'],
    credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'API up and running', date: new Date() });
});

app.use(authenticate);

// Routes
app.use('/' + BaseRoute.user, userRouter);
app.use('/' + BaseRoute.chat, chatRouter);
app.use('/' + BaseRoute.session, sessionRouter);
app.use('/' + BaseRoute.cache, cacheRouter);

// Error handling
app.get('*', notFoundHandler);
app.use(errorHandler);


export default app;
