import { Order } from '@/app/admin/orders/page';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { IRoutes } from '@/app/utils/type';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { days } from '@/app/lib/constant';
import axios from 'axios';
import { AlertColor } from '@mui/material';


const useManifest = (
  orderList: Order[],
  selectedRoutes: IRoutes[],
  date: string,
  showNotification: (type: AlertColor, message: string) => void,
) => {
  // const [debouncedSelectedRoutes, setDebouncedSelectedRoutes] = useState<
  //   IRoutes[]
  // >([]);
  const [manifestData, setManifestData] = useState<any>({
    orderPrint: [],
    itemManifest: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderPrint, setOrderPrint] = useState<any>([]);
  const [itemManifest, setItemManifest] = useState<any>({});

  const selectedRouteIds = useMemo(() => {
    return selectedRoutes.map((route: IRoutes) => {
      return route.id;
    });
  }, [selectedRoutes]);

  const formattedDate = new Date(date);
  const givenDay = days[formattedDate.getDay()];

  const { data: userRoute } = useSWR(
    `${API_URL.ROUTES}/clients?day=${givenDay}`,
  );

  // useEffect(() => {
  //   setIsLoading(true);
  //   const timeoutId = setTimeout(() => {
  //     setDebouncedSelectedRoutes(selectedRoutes);
  //     setIsLoading(false);
  //   }, 1000);

  //   return () => {
  //     clearTimeout(timeoutId);
  //   };
  // }, [selectedRoutes]);

  useEffect(() => {
    if (userRoute && orderList.length > 0) {
      handleGetManifest();
    }
  }, [userRoute, orderList]);

  useEffect(() => {
    if (manifestData && selectedRoutes.length > 0) {
      handleSelectRoute();
    }
  }, [selectedRoutes]);

  const handleGetManifest = async () => {
    // const compressedData = pako.deflate(JSON.stringify({
    //   day: givenDay,
    //   orderList,
    //   userRoute: userRoute?.data,
    // }), { to: 'string' });

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.ADMIN}/manifest`, {
          day: givenDay,
          orderList,
          userRoute: userRoute?.data,
        }, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      setManifestData(response.data.data);

      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
      setIsLoading(false);
    }
  };

  const handleSelectRoute = () => {
    const newOrderPrint = manifestData.orderPrint.filter((order: any) =>
      selectedRouteIds.includes(order.routeId),
    );

    setOrderPrint(newOrderPrint);

    const newManifest: any = {};
    selectedRouteIds.forEach((routeId: number) => {
      newManifest[routeId] = manifestData.itemManifest[routeId];
    });

    setItemManifest(newManifest);
  };

  // Filter void orders and sort it by user route
  const nonVoidOrders = useMemo(() => {
    if (!userRoute?.data) {
      return [];
    }

    const filteredVoidOrders = orderList.filter(
      (order: Order) => order.status !== ORDER_STATUS.VOID,
    );

    return filteredVoidOrders;
  }, [orderList, userRoute]);

  return {
    orderPrint,
    itemManifest,
    setItemManifest,
    nonVoidOrders,
    isLoading,
  };
};

export default useManifest;
