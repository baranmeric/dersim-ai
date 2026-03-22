import 'dotenv/config';
import connectDB from './config/db';
import config from "./config";
import app from "./app";
import { Logger, TAG } from './helper/logger';
import { createServer } from 'http';
import { socketManager } from './socket/socketManager';

const PORT = config.port;

// Connect to MongoDB
connectDB().then(() => {
    const httpServer = createServer(app);
    socketManager.upgrade(httpServer);

    httpServer.listen(PORT, () => {
        Logger.info(TAG.SYSTEM, `Server running on port ${PORT}`);
    });
});
