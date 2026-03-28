import 'dotenv/config';
import { connectDB, config, Logger, TAG, socketManager } from '@dersim/api/core';
import app from "./app";
import { createServer } from 'http';

const PORT = config.port;

// Connect to MongoDB
connectDB().then(() => {
    const httpServer = createServer(app);
    socketManager.upgrade(httpServer);

    httpServer.listen(PORT, () => {
        Logger.info(TAG.SYSTEM, `Server running on port ${PORT}`);
    });
});
