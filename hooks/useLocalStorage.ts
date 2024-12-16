import { useEffect, useState } from 'react';

export interface ILocalNoti {
  title: string;
  description: string;
}

const useLocalStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState<any>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use this to avoid hydrating in next.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        setValue(JSON.parse(storedValue));
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
