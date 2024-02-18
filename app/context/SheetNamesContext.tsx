'use client';
import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { API_URL } from '../utils/enum';
import { ValueType } from '../components/Select';

export const SheetNamesContext = createContext<ValueType[]>([]);

export default function SheetNamesContextAPI({ children }: any) {
  const [sheetNames, setSheetNames] = useState<ValueType[]>([]);

  useEffect(() => {
    fetchSheetNames();
  }, []);

  const fetchSheetNames = async () => {
    try {
      const response = await axios.get(API_URL.SHEETS);

      const data = response.data.data.map((sheet: ValueType) => {
        return {
          value: sheet,
          label: sheet,
        };
      });

      setSheetNames(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SheetNamesContext.Provider value={sheetNames}>
      {children}
    </SheetNamesContext.Provider>
  );
}
