import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponseWithSocket } from '../socket';

let io: any;

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    path: '/api/socket',
  });

  return io;
};

export const getSocketInstance = (res: NextApiResponseWithSocket) => {
    return res.socket.server.io;
};
