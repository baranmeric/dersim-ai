import { DatabaseError, AppError } from '@dersim/shared';
import { Logger, TAG } from './logger';
import mongoose from 'mongoose';

export function createServiceProxy<T extends object>(service: T): T {
    return new Proxy(service, createProxyHandler());
}

const createProxyHandler = <T extends object>() => {
    return {

        handleError(error: any, prop: string | symbol) {
            if (error instanceof mongoose.Error) {
                Logger.error(TAG.DATABASE, `MongoDB error in ${String(prop)}: ${error.message}`);
                throw new DatabaseError(`Database operation failed: ${error.message}`);
            } else if (error instanceof AppError) {
                Logger.error(TAG.HTTP, `${error.errorType} in ${String(prop)}: ${error.message}`);
                throw error;
            }
            Logger.error(TAG.ERROR, `Unhandled error in ${String(prop)}: ${error.message}`);
            throw error;
        },

        get(target: T, prop: string | symbol) {
            const originalMethod = target[prop as keyof T];

            if (typeof originalMethod !== 'function') {
                return originalMethod;
            }

            const isAsync = originalMethod.constructor.name === 'AsyncFunction';

            if (isAsync) {
                return async (...args: any[]) => {
                    try {
                        return await originalMethod.apply(target, args);
                    } catch (error) {
                        this.handleError(error, prop);
                    }
                };
            } else {
                return (...args: any[]) => {
                    try {
                        return originalMethod.apply(target, args);
                    } catch (error) {
                        this.handleError(error, prop);
                    }
                };
            }
        }
    };
};
