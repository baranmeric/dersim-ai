import mongoose from 'mongoose';
import config from './config/environmentConfig';
import { Logger, TAG } from './logger';

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(config.db_uri);
        Logger.info(TAG.SYSTEM, `MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        Logger.error(TAG.SYSTEM, `MongoDB Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
};

export default connectDB;
