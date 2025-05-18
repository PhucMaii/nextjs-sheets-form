'use client';
import React, { ReactNode, createContext } from 'react';
// import { getAdminApiUrl } from '../utils/enum';
import { fetcher } from '../../HOC/AuthenGuard';
import useSWR from 'swr';
// import { useParams } from 'next/navigation';

export const UserContext = createContext<any>([]);

const UserContextAPI = ({ children }: { children: ReactNode }) => {
  // const { companyId }: any = useParams();
  const { data: session } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });

  console.log(session, 'session');

  const {
    data: user,
    mutate,
    isValidating,
  } = useSWR(
    session?.user
      ? `/api/user?id=${session.user.id}&role=${session?.user?.role}`
      : null,
    fetcher,
    {
      refreshInterval: 1000,
    },
  );

  return (
    <UserContext.Provider value={{ user: user?.data, mutate, isValidating }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextAPI;
