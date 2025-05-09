import { Order } from '@/app/admin/[companyId]/orders/page';
import { ORDER_STATUS, getAdminApiUrl } from '@/app/utils/enum';
import { IRoutes } from '@/app/utils/type';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { days } from '@/app/lib/constant';
import axios from 'axios';
import { AlertColor } from '@mui/material';
import { useParams } from 'next/navigation';

const useManifest = (
  orderList: Order[],
  selectedRoutes: IRoutes[],
  date: string,
  showNotification: (type: AlertColor, message: string) => void,
) => {
  const [manifestData, setManifestData] = useState<any>({
    orderPrint: [],
    itemManifest: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderPrint, setOrderPrint] = useState<any>([]);
  const [itemManifest, setItemManifest] = useState<any>({});
  const { companyId }: any = useParams();

  const selectedRouteIds = useMemo(() => {
    return selectedRoutes.map((route: IRoutes) => {
      return Number(route.id);
    });
  }, [selectedRoutes]);

  const formattedDate = new Date(date);
  const givenDay = days[formattedDate.getDay()];

  const { data: userRoute } = useSWR(
    getAdminApiUrl(companyId, `/routes/clients?day=${givenDay}`),
  );

  useEffect(() => {
    if (userRoute && orderList.length > 0) {
      handleGetManifest();
    }
  }, [userRoute, orderList]);

  useEffect(() => {
    if (manifestData && selectedRoutes.length > 0) {
      handleSelectRoute();
    }
  }, [selectedRoutes, manifestData]);

  const handleGetManifest = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/manifest'),
        {
          day: givenDay,
          orderList,
          userRoute: userRoute?.data,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      setManifestData(response.data.data);

      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      // showNotification(
      //   'error',
      //   'There was an error: ' + error.response.data.error,
      // );
      setIsLoading(false);
    }
  };

  const handleSelectRoute = () => {
    const newOrderPrint = manifestData.orderPrint.filter((order: any) => {
      return selectedRouteIds.includes(order.routeId);
    });

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
    manifestData,
  };
};

export default useManifest;
