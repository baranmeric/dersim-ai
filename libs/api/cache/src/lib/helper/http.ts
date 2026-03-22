import { NextFunction, Response, Request } from "express";
import { HttpStatus } from '@dersim/shared';
import CacheService, { CacheOptions } from '../service/cache.service';

export const Http = {
    async respond<T>(
        req: Request,
        res: Response,
        next: NextFunction,
        serviceMethod: Promise<T>,
        cacheTtl?: number) {

        const cacheQuery = req.query.cache;
        const cacheEnabled = cacheTtl && cacheQuery !== 'false';

        try {
            if (cacheEnabled) {
                const key = this.getCacheKey(req);
                const cachedData = await CacheService.get(key);
                if (cachedData) {
                    this.respondWithSuccess(res, cachedData);
                    return;
                }
            }

            const freshData = await serviceMethod;
            if (!freshData) {
                res.status(HttpStatus.NO_CONTENT).end();
                return;
            }

            if (cacheEnabled) {
                const cacheOptions: CacheOptions = { key: this.getCacheKey(req), ttl: cacheTtl };
                await CacheService.set(freshData, cacheOptions);
            }

            this.respondWithSuccess(res, freshData);
        } catch (error) {
            next(error);
        }
    },

    respondWithSuccess<T>(res: Response, data: T) {
        res.status(HttpStatus.OK).json(data);
    },

    getCacheKey(req: Request) {
        return `${req.path}: ${req.userId}`;
    },
};
