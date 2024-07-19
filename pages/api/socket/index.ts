import { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const corsMiddleware = cors();

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
        console.log('A client connected');
        console.log(`A client connected. ID: ${clientId}`);
        io.emit('client-new', clientId);

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
