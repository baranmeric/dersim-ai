import { Request, Response, NextFunction } from 'express';
import { ParamError } from '@dersim/shared';
import CacheService from '../service/cache.service';
import { Http } from '../helper/http';

const CacheController = {
    async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        Http.respond(req, res, next, CacheService.getStats());
    },

    async clearAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        await CacheService.clearAll();
        Http.respond(req, res, next, CacheService.clearAll());
    },

    async getKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        Http.respond(req, res, next, CacheService.get(req.params.key));
    },

    async setKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { key, ttl } = req.params;
        const { value } = req.body;
        if (!value) {
            next(new ParamError('Value is required'));
            return;
        }
        Http.respond(req, res, next, CacheService.set(value, { key, ttl: Number(ttl) }));
    },

    async deleteKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        Http.respond(req, res, next, CacheService.delete(req.params.key));
    },
};

export default CacheController;
