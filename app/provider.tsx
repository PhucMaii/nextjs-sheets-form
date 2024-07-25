'use client';

import axios from 'axios';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import AuthenGuard from '../HOC/AuthenGuard';
import { SocketProvider } from '@/HOC/SocketContext';

type Props = {
  children?: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <AuthenGuard>
        <SocketProvider>
          <SWRConfig
            value={{
              fetcher: (url: string) => axios.get(url).then((r) => r.data),
            }}
          >
            {children}
          </SWRConfig>
        </SocketProvider>
      </AuthenGuard>
    </SessionProvider>
  );
};
