'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Mode = 'auto' | 'admin' | 'driver';

export const DashboardModeContext = createContext<{
  mode: Mode;
  setMode: (mode: Mode) => void;
}>({
  mode: 'auto',
  setMode: () => {},
});

export const DashboardModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<Mode>('auto');

  useEffect(() => {
    const m = (localStorage.getItem('dashboardMode') as Mode) || 'auto';
    console.log(m, 'm');
    setModeState(JSON.parse(m));
    // keep in sync if another tab changes it
    const onStorage = () => {
      const modeLs = localStorage.getItem('dashboardMode') as Mode;
      console.log(modeLs, 'modeLs');
      setModeState(JSON.parse(modeLs));
    };
    
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem('dashboardMode', m);
    // Optional: dispatch a custom event for same-tab listeners that don’t share context
    window.dispatchEvent(new CustomEvent('dashboardMode:set', { detail: m }));
  };

  return (
    <DashboardModeContext.Provider value={{ mode, setMode }}>
      {children}
    </DashboardModeContext.Provider>
  )
}

export const useDashboardMode = () => {
  return useContext(DashboardModeContext);
}