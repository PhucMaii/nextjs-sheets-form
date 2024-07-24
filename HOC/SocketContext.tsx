import { createContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }: any) => {
  const socket: any = useRef(null);

  useEffect(() => {
    // Initialize the socket connection
    socket.current = io('http://localhost:3000', {
        path: '/api/socket',
      });

    socket.current.on('connect', () => {
      console.log('Connected to socket.io server');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket.current}>
        {children}
    </SocketContext.Provider>
  )
};
