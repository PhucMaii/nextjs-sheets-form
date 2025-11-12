import React, { createContext, useContext, useMemo } from 'react';
import axios from 'axios';
import { UserContext } from './UserContextAPI';
import { useQuery } from '@tanstack/react-query';

export const MaintenanceContext = createContext<any>({
  isMaintenance: false,
  isValidating: false,
});

const MaintenanceProvider = ({ children }: any) => {
  // Always call useContext - never conditionally
  const userContext = useContext(UserContext);
  const user = userContext?.user;

  // Always call useQuery - never conditionally
  const { data, isLoading } = useQuery({
    queryKey: ['shut-down', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) {
        return { isShutDown: false };
      }
      try {
        const response = await axios.get(
          '/api/health-status?companyId=' + user.companyId,
        );
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch health status:', error);
        return { isShutDown: false };
      }
    },
    enabled: !!user?.companyId,
    retry: false,
  });

  // Always call useMemo - never conditionally
  const isMaintenance = data?.isShutDown || false;

  const contextValue = useMemo(
    () => ({ isMaintenance, isValidating: isLoading }),
    [isMaintenance, isLoading],
  );

  // Always return - never conditionally
  return (
    <MaintenanceContext.Provider value={contextValue}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export default MaintenanceProvider;
