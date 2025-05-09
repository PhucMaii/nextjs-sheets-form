'use client';
import React, { useEffect } from 'react';
import axios from 'axios';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import AuthenGuard from '../HOC/AuthenGuard';
import MaintenanceProvider from './context/MaintenanceProvider';
import { DragDropProvider } from '@dnd-kit/react';
import registerSW from './registerSW';

type Props = {
  children?: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <SessionProvider>
      <AuthenGuard>
        <DragDropProvider>
          <SWRConfig
            value={{
              fetcher: (url: string) => axios.get(url).then((r) => r.data),
            }}
          >
            <MaintenanceProvider>{children}</MaintenanceProvider>
          </SWRConfig>
        </DragDropProvider>
      </AuthenGuard>
    </SessionProvider>
  );
};
