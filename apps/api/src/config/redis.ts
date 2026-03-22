import Redis from 'ioredis';
import dotenv from 'dotenv';
import { Logger, TAG } from '../helper/logger';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
    Logger.info(TAG.CACHE, '✅ Redis connected successfully');
});

redis.on('error', (error) => {
    Logger.info(TAG.CACHE, '❌ Redis connection error:', error);
});

redis.on('close', () => {
    Logger.info(TAG.CACHE, '🔌 Redis connection closed');
});

export default redis; 
