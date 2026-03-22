import { Request, Response, NextFunction } from 'express';
import http from '../helper/http';
import CacheService from '../service/cache.service';
import { ParamError } from '@dersim/shared';

const CacheController = {
    async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        http.respond(req, res, next, CacheService.getStats());
    },

    async clearAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        await CacheService.clearAll();
        http.respond(req, res, next, CacheService.clearAll());
    },

    async getKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { key } = req.params;
        http.respond(req, res, next, CacheService.get(key));
    },

    async setKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { key, ttl } = req.params;
        const { value } = req.body;
        if (!value) {
            next(new ParamError('Value is required'));
            return;
        }
        http.respond(req, res, next, CacheService.set(value, { key, ttl: Number(ttl) }))
    },

    async deleteKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { key } = req.params;
        http.respond(req, res, next, CacheService.delete(key))
    }
};

export default CacheController; 
