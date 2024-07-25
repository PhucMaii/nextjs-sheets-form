import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: any;

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    path: '/api/socket',
  });

  return io;
};

export const getSocketInstance = (res: any) => {
    return res.socket.server.io;
};
