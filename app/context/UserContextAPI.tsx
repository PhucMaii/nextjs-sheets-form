'use client';
import React, { ReactNode, createContext, useEffect, useState } from 'react';
import { UserType } from '../utils/type';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { useSession } from 'next-auth/react';

export const UserContext = createContext<UserType | null>(null);

const UserContextAPI = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserType | null>(null);
  const { data: session }: any = useSession();

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${API_URL.USER}?id=${session?.user?.id}`,
      );

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      setUserData(response.data.data);
    } catch (error: any) {
      console.log('Fail to fetch user data in context: ', error);
    }
  };

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
};

export default UserContextAPI;
