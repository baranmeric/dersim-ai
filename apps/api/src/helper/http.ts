import { NextFunction, Response, Request } from "express";
import { HttpStatus } from '@dersim/shared';
import cacheService, { CacheOptions } from "../service/cache.service";

const Http = {
    async respond<T>(
        req: Request,
        res: Response,
        next: NextFunction,
        serviceMethod: Promise<T>,
        cacheTtl?: number) {

        const cacheQuery = req.query.cache;
        const cacheEnabled = cacheTtl && cacheQuery !== 'false';

        try {
            // Try cache if options are set
            if (cacheEnabled) {
                const key = this.getCacheKey(req);
                const cachedData = await cacheService.get(key);
                if (cachedData) {
                    this.respondWithSuccess(res, cachedData);
                    return;
                }
            }

            // Fetch fresh data from service
            const freshData = await serviceMethod;
            if (!freshData) {
                res.status(HttpStatus.NO_CONTENT).end();
                return;
            }

            // Set cache if options are set
            if (cacheEnabled) {
                const cacheOptions: CacheOptions = {
                    key: this.getCacheKey(req),
                    ttl: cacheTtl,
                }
                await cacheService.set(freshData, cacheOptions);
            }

            this.respondWithSuccess(res, freshData);
        } catch (error) {
            // Pass error onto errorHandler.ts middleware
            next(error);
        }
    },

    respondWithSuccess<T>(res: Response, data: T) {
        res.status(HttpStatus.OK).json(data);
    },

    getCacheKey(req: Request) {
        const userId = req.userId;
        const path = req.path;
        return `${path}: ${userId}`;
    }
}

export default Http;
