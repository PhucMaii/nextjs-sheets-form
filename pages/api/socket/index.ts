import { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import cors from 'cors';

const corsMiddleware = cors();

// Initialize Redis
const redis = new Redis({
    host: 'redis',
    port: 6379
})

export type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
      server: HTTPServer & {
        io?: SocketIOServer;
      };
    };
  };

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        console.log("Already set up");
        res.end();
        return;
    }
    
    const io = new SocketIOServer(res.socket.server, {
        path: '/api/socket',
    });

    io.on('connection', (socket: any) => {
        const clientId = socket.id;
        console.log(`A client connected. ID: ${clientId}`);

        socket.on('login', async (userId: string, sessionId: string) => {
            await redis.set(`session:${sessionId}`, userId);
            socket.join(userId);
            console.log(`User ${userId} logged in with session ${sessionId}`)
        })
        // io.emit('client-new', clientId);

        socket.on('disconnect', () => {
            console.log('A client disconnected.');
        });
    })

    corsMiddleware(req, res, () => {
        res.socket.server.io = io;
        res.end();
    });

    res.end();

}
