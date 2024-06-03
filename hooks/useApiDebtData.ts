import { API_URL } from '@/app/utils/enum';
import axios from 'axios';
import { useEffect, useState } from 'react';

const useApiDebtData = (userId: number, endMonth: number) => {
  const [debtData, setDebtData] = useState<any>();
  const [sortDebtKeys, setSortDebtKeys] = useState<any>();

  useEffect(() => {
    if (userId) {
      fetchDebtData();
    }
  }, [userId, endMonth]);

  const calculateTotalPrice = (debtList: any) => {
    const totalPrice = Object.keys(debtList).reduce(
      (acc: number, debtMonth: string) => {
        return acc + debtList[debtMonth];
      }, 0);

    return totalPrice;
  };

  const fetchDebtData = async () => {
    try {
      const response = await axios.get(
        `${API_URL.CLIENTS}/debt?userId=${userId}&endMonth=${endMonth}`,
      );

      if (response.data.error) {
        console.log(response.data.error);
        return;
      }

      const totalPrice = calculateTotalPrice(response.data.data);
      const debtList = { ...response.data.data, 'Balance Due': totalPrice }
      const sortedKeys = sortKeys(debtList);

      setSortDebtKeys(sortedKeys);
      setDebtData(debtList);
    } catch (error: any) {
      console.log('There was an error fetching debt data: ', error);
    }
  };

  const sortKeys = (debtList: any) => {
    const sortedKeys = Object.keys(debtList).sort((key1, key2) => {
      const month1 = Number(key1.split('/')[0]);
      const month2 = Number(key2.split('/')[0]);

      return month1 - month2;
    });

    return sortedKeys;
  };

  return { debtData, sortDebtKeys };
};

export default useApiDebtData;
