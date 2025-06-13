'use client';
import React, { useEffect } from 'react';
import axios from 'axios';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import AuthenGuard from '../HOC/AuthenGuard';
import MaintenanceProvider from './context/MaintenanceProvider';
import { Provider } from 'react-redux';
import { store } from '@/state/store';
import { DragDropProvider } from '@dnd-kit/react';
import registerSW from './registerSW';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type Props = {
  children?: React.ReactNode;
};

const queryClient = new QueryClient();

export const Providers = ({ children }: Props) => {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <SessionProvider>
      <AuthenGuard>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </AuthenGuard>
      <Toaster />
    </SessionProvider>
  );
};
