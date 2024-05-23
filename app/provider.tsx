'use client';

import axios from 'axios';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import AuthenGuard from './HOC/AuthenGuard';

type Props = {
  children?: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <AuthenGuard>
        <SWRConfig
          value={{
            fetcher: (url: string) => axios.get(url).then((r) => r.data),
          }}
        >
          {children}
        </SWRConfig>
      </AuthenGuard>
    </SessionProvider>
  );
};
