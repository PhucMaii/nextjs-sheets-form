import { io } from 'socket.io-client';
let socket: any;

export const connectSocket = async (sessionId: string) => {
  await fetch('/api/socket');
  if (!socket) {
    socket = io({ path: '/api/socket', query: { sessionId } });
  }

  socket.on('connect', () => {
    console.log(`Connected with socket ID: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('Disconnect from socket');
  });
};

export const assignSocket = (userId: string, sessionId: string) => {
  if (socket) {
    socket.emit('login', userId, sessionId);
  } else {
    console.error('Socket is not connected');
  }
};
