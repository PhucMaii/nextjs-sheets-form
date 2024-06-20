'use client';
import React, { ReactNode, createContext } from 'react';
import { API_URL } from '../utils/enum';
import { fetcher } from '../HOC/AuthenGuard';
import useSWR from 'swr';

export const UserContext = createContext<any>([]);

const UserContextAPI = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: user,
    mutate,
    isValidating,
  } = useSWR(
    session?.user ? `${API_URL.USER}?id=${session.user.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return (
    <UserContext.Provider value={{ user: user?.data, mutate, isValidating }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextAPI;
