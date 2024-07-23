import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import cors from 'cors';

const corsMiddleware = cors();

// Initialize Redis
const redis = new Redis({
  host: 'redis',
  port: 6379,
});

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  if (res.socket.server.io) {
    console.log('Already set up');
    res.end();
    return;
  }

  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socket',
  });

  io.on('connection', (socket: any) => {
    const clientId = socket.id;
    console.log(`A client connected. ID: ${clientId}`);

    // socket.on('change', async (data: any) => {
    //     const { sessionId, changes } = data;
    //     await redis.set(`session:${sessionId}`, JSON.stringify(changes));
    //     socket.broadcast.emit('update', changes);
    // });

    // Listen to order page
    socket.on('change-order', async (data: any) => {
      await synchronizeLocalChange(socket, data, 'update-order');
    });
    socket.on('disconnect', () => {
      console.log('A client disconnected.');
    });
  });

  corsMiddleware(req, res, () => {
    res.socket.server.io = io;
    res.end();
  });

  res.end();
}

const synchronizeLocalChange = async (
  socket: any,
  data: any,
  sendingMsg: string,
) => {
  const { sessionId, changes } = data;
  await redis.set(`session:${sessionId}`, JSON.stringify(changes));
  socket.broadcast.emit(sendingMsg, changes);
};
