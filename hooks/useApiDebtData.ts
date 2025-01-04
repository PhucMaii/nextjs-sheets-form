import { API_URL } from '@/app/utils/enum';
import axios from 'axios';
import { useEffect, useState } from 'react';

const useApiDebtData = (
  userId: number,
  endMonth: number,
  endYear: number,
  orderList: any,
) => {
  const [debtData, setDebtData] = useState<any>();
  const [sortDebtKeys, setSortDebtKeys] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      fetchDebtData();
    }
  }, [userId, endMonth, orderList]);

  const calculateTotalPrice = (debtList: any) => {
    const totalPrice = Object.keys(debtList).reduce(
      (acc: number, debtMonth: string) => {
        return acc + debtList[debtMonth];
      },
      0,
    );

    return totalPrice;
  };

  const fetchDebtData = async () => {
    try {
      const response = await axios.get(
        `${API_URL.CLIENTS}/debt?userId=${userId}&endMonth=${endMonth}&endYear=${endYear}`,
      );

      if (response.data.error) {
        console.log(response.data.error);
        setIsLoading(false);
        return;
      }

      const totalPrice = calculateTotalPrice(response.data.data);
      const debtList = { ...response.data.data, 'Balance Due': totalPrice };
      const sortedKeys = sortKeys(debtList);

      setSortDebtKeys(sortedKeys);
      setDebtData(debtList);
      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error fetching debt data: ', error);
      setIsLoading(false);
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

  return { debtData, sortDebtKeys, isLoading };
};

export default useApiDebtData;
