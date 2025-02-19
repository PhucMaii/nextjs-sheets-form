// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useState } from 'react';

export interface ILocalNoti {
  title: string;
  description: string;
}

const useLocalStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState<any>(localStorage.getItem(key) || defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use this to avoid hydrating in next.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(key);
      if (storedValue && storedValue !== 'undefined') {
        try {
          setValue(JSON.parse(storedValue));
        } catch (e) {
          setValue(storedValue);
        }
      }
      setIsInitialized(true);
    }
  }, [key]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, isInitialized]);

  const setLocalStorageValue = (newValue: any) => {
    setValue(newValue);
  };

  return [value, setLocalStorageValue, isInitialized];
};

export default useLocalStorage;
