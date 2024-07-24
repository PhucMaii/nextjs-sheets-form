import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import cors from 'cors';
import { initializeSocket } from '../utils/socketManager';

const corsMiddleware = cors();

// Initialize Redis
const redis = new Redis({
  host: 'redis',
  port: 6379,
});

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io: SocketIOServer;
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

  initializeSocket(res.socket.server);
  res.socket.server.io = initializeSocket(res.socket.server);

  res.socket.server.io.on('connection', (socket: any) => {
    const clientId = socket.id;
    console.log(`A client connected. ID: ${clientId}`);

    // Listen to order page
    socket.on('change-order', async (data: any) => {
      await synchronizeLocalChange(socket, data, 'update-order');
    });

    // Listen to item page
    socket.on('change-item-page', async (data: any) => {
      await synchronizeLocalChange(socket, data, 'update-item-page');
    });

    // Listen to report page
    socket.on('change-report-page', async (data: any) => {
      await synchronizeLocalChange(socket, data, 'update-report-page');
    });

    // Listen to preOrder page
    socket.on('change-preOrder-page', async (data: any) => {
      await synchronizeLocalChange(socket, data, 'update-preOrder-page');
    });

    socket.on('disconnect', () => {
      console.log('A client disconnected.');
    });
  });

  corsMiddleware(req, res, () => {
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
