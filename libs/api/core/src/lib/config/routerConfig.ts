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

const adminRoutes: RouteConfig[] = [
    { path: '/session/all', method: 'GET' },
    { path: '/user/:id', method: 'GET' },
    { path: '/user/all', method: 'GET' },
];

export const isPublicRoute = (req: Request): boolean => {
    return publicRoutes.some(route => route.path === req.path && route.method === req.method);
};

export const isAdminRoute = (req: Request): boolean => {
    return adminRoutes.some(route => route.path === req.path && route.method === req.method);
};
