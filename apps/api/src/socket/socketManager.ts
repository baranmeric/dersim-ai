import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "cookie";
import { getUserIdFromToken } from "../middleware/auth";
import { Notification } from '@dersim/shared';
import { Logger, TAG } from "../helper/logger";

interface AuthenticatedRequest extends IncomingMessage {
    userId: string;
}

class SocketManager {
    private httpServer?: HttpServer;
    private socketServer?: WebSocketServer;
    private clients: Map<string, WebSocket> = new Map();

    constructor() { }

    upgrade(httpServer: HttpServer) {
        this.httpServer = httpServer;
        this.httpServer.on('upgrade', (req: IncomingMessage, socket, head) => {
            Logger.info(TAG.SYSTEM, `WebSocket upgraded and ready to connect`);

            try {
                const cookies = parse(req.headers.cookie || '');
                const token = cookies.token;
                if (!token) throw new Error('No token');

                const userId = getUserIdFromToken(token);
                if (!userId) throw new Error('Invalid token');

                // attach identity to the request
                (req as AuthenticatedRequest).userId = userId;
            } catch {
                socket.destroy();
            }
        });

        this.socketServer = new WebSocketServer({ server: httpServer });

        this.socketServer.on('connection', (socket: WebSocket, req: AuthenticatedRequest) => {
            if (!req.userId) {
                this.onUnauthorized(socket);
                return;
            }

            this.clients.set(req.userId, socket);
            this.logClients();

            socket.on('close', () => {
                this.clients.delete(req.userId);
            });
        });
    }

    private logClients() {
        console.log('Client List:');
        for (const [key, value] of this.clients) {
            console.log(key);
        }
    }

    private onUnauthorized(socket: WebSocket) {
        console.error('Unauthorized');
        socket.close(1008, 'Unauthorized');
    }

    broadcast(message: string | object): void {
        const payload = typeof message === 'string' ? message : JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(payload);
            }
        });
    }

    notifyClient(userId: string, notification: Notification): void {
        this.logClients();
        const client = this.clients.get(userId);
        if (client && client.readyState === 1) {
            const payload = JSON.stringify(notification);
            client.send(payload);
            Logger.info(TAG.SYSTEM, 'websocket message sent', payload);
        }
    }
}

export const socketManager = new SocketManager();

