import { Request } from "express";

interface RouteConfig {
    path: string;
    method: string;
}

const publicRoutes: RouteConfig[] = [
    { path: '/', method: 'GET' },
    { path: '/user/login', method: 'POST' },
    { path: '/user/register', method: 'POST' },
];

export const isPublicRoute = (req: Request): boolean => {
    return publicRoutes.some(route => route.path === req.path && route.method === req.method);
};
