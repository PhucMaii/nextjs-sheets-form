'use client';
import React from 'react';
import axios from 'axios';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import AuthenGuard from '../HOC/AuthenGuard';
import MaintenanceProvider from './context/MaintenanceProvider';
import { Provider } from 'react-redux';
import { store } from '@/state/store';
import { DragDropProvider } from '@dnd-kit/react';

type Props = {
  children?: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <AuthenGuard>
        <DragDropProvider>
          <Provider store={store}>
            <SWRConfig
              value={{
                fetcher: (url: string) => axios.get(url).then((r) => r.data),
              }}
            >
              <MaintenanceProvider>{children}</MaintenanceProvider>
            </SWRConfig>
          </Provider>
        </DragDropProvider>
      </AuthenGuard>
    </SessionProvider>
  );
};
