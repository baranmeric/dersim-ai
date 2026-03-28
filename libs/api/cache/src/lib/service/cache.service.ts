import { redis, createServiceProxy } from '@dersim/api/core';

export interface CacheOptions {
    key: string;
    ttl: number;
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CacheService = {
    async set<T>(value: T, options: CacheOptions): Promise<void> {
        try {
            const cacheEntry: CacheEntry<T> = { data: value, timestamp: Date.now() };
            await redis.setex(options.key, options.ttl, JSON.stringify(cacheEntry));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    },

    async get<T>(key: string): Promise<T | null> {
        try {
            const cached = await redis.get(key);
            if (!cached) return null;
            const cacheEntry: CacheEntry<T> = JSON.parse(cached);
            return cacheEntry.data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    },

    async delete(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    },

    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    },

    async getStats(): Promise<{ keys: number; memory: string }> {
        try {
            const info = await redis.info('memory');
            const keys = await redis.dbsize();
            const memoryMatch = info.match(/used_memory_human:(\S+)/);
            const memory = memoryMatch ? memoryMatch[1] : 'unknown';
            return { keys, memory };
        } catch (error) {
            console.error('Cache stats error:', error);
            return { keys: 0, memory: 'unknown' };
        }
    },

    async clearAll(): Promise<void> {
        try {
            await redis.flushdb();
        } catch (error) {
            console.error('Cache clear all error:', error);
        }
    },
};

export default createServiceProxy(CacheService);
