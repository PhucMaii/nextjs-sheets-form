'use client';
import React, { ReactNode, createContext, useEffect, useState } from 'react';
import { UserType } from '../utils/type';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { useSession } from 'next-auth/react';
import { SplashScreen } from '../HOC/AuthenGuard';

export const UserContext = createContext<UserType | null>(null);

const UserContextAPI = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: session }: any = useSession();

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL.USER}?id=${session?.user?.id}`,
      );

      if (response.data.error) {
        alert(response.data.error);
        setIsLoading(false);
        return;
      }

      setUserData(response.data.data);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to fetch user data in context: ', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
};

export default UserContextAPI;
