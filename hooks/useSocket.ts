import { UserContext } from '@/app/context/UserContextAPI';
import { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (receivingMsg: string, sendingMsg: string) => {
  const [socket, setSocket] = useState<any>(null);
  const [changes, setChanges] = useState<any>(null);

  const { user } = useContext(UserContext);

  useEffect(() => {
    const socket = io('http://localhost:3000', {
      path: '/api/socket',
    });

    socket.on('connect', () => {
      console.log('Connected to socket.io server');
    });

    socket.on(receivingMsg, (changes: any) => {
      setChanges(changes);
      console.log('Received update:', changes);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const emitChange = (changes: any) => {
    if (socket) {
      socket.emit(sendingMsg, { userId: user.id, sessionId: user.id, changes });
    }
  };

  return [ changes, emitChange ];
};

export default useSocket;
