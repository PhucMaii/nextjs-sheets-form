import { Dispatch, SetStateAction } from 'react';
import { Notification } from './type';
import axios from 'axios';
import useSWR from 'swr';
import { fetcher } from '@/HOC/AuthenGuard';
import { getAdminApiUrl } from './enum';
import { Order } from '../admin/[companyId]/orders/page';
import { AlertColor } from '@mui/material';

export const fetchData = async (
  api: string,
  setNotification: Dispatch<SetStateAction<Notification>>,
) => {
  try {
    const response = await axios.get(api);

    if (response.data.error) {
      setNotification({
        on: true,
        type: 'error',
        message: response.data.error,
      });
    }

    return response.data.data;
  } catch (error: any) {
    console.log('There was an error: ', error);
    setNotification({
      on: true,
      type: 'error',
      message: 'There was an error: ' + error.response.data.error,
    });
  }
};

export const fetchApi = async (
  api: string,
  showNotification?: (type: AlertColor, message: string) => void,
) => {
  try {
    const response = await axios.get(api);

    if (response.data.error) {
      showNotification && showNotification('error', response.data.error);
      return null;
    }

    return response.data.data;
  } catch (error: any) {
    console.log('There was an error: ', error);
    showNotification && showNotification('error', error.response.data.error);
    return null;
  }
};

export const SWRFetchData = (api: string) => {
  const { data, mutate, isValidating } = useSWR(api, fetcher, {
    refreshInterval: 1000,
  });

  return [data, mutate, isValidating];
};

export const fetchWcodOrders = async (
  orderList: any,
  selectedDate: string,
  wcodDay: string,
  companyId: string,
) => {
  if (!companyId || !selectedDate || !wcodDay) {
    return null;
  }

  try {
    const clientIds = orderList
      .filter((order: Order) => {
        return order?.user?.preference?.paymentType === wcodDay;
      })
      .map((order: Order) => order.userId);

    if (clientIds.length === 0) {
      return null;
    }

    const response = await axios.get(
      getAdminApiUrl(
        companyId,
        `/wcod?clientIdList=${[...clientIds]}&date=${selectedDate}`,
      ),
    );

    if (response.data.error) {
      console.log(response.data.error);
      return null;
    }

    return response.data.data;
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};
