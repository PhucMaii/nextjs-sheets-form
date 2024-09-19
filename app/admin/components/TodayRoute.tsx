import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Order } from '../orders/page';
import { UserRoute } from '@prisma/client';
import { ORDER_STATUS } from '@/app/utils/enum';
import { Notification } from '@/app/utils/type';
import { getCODData } from '@/app/utils/array';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps {
  orderData: any;
  routes: any; // all routes in that day
  date: string;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function TodayRoute({
  orderData,
  routes,
  date,
  setNotification,
}: IProps) {
  const [routeData, setRouteData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (orderData.length > 0 && routes.length > 0) {
      getRouteData();
    }
  }, [orderData, routes]);

  const getRouteData = async () => {
    setIsLoading(true);
    try {
      const newRouteData = [];
      for (const route of routes) {
        const routeOrders = filterOrderByRoute(route);
        const analysisOrders = await getCODData(routeOrders, date);

        newRouteData.push({
          ...analysisOrders,
          driverId: route.driverId,
          driverName: route.driver.name,
        });
      }

      setRouteData(newRouteData);
      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error,
      });
      setIsLoading(false);
    }
  };

  const filterOrderByRoute = (targetRoute: any) => {
    if (routes.length === 0 || !targetRoute || orderData.length === 0) {
      return [];
    }

    // Get clients from that route -> get orders
    const filteredOrders = targetRoute.clients
      .map((client: UserRoute) => {
        // Find client order in order data
        const clientOrder = orderData.find(
          (order: Order) => order.userId === client.userId,
        );
        return clientOrder;
      })
      .filter(
        (order: Order) =>
          order !== undefined && order.status !== ORDER_STATUS.VOID,
      );

    return filteredOrders;
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Delivered</TableCell>
            <TableCell>Delivery Orders</TableCell>
            <TableCell>Collected Money</TableCell>
            <TableCell>Uncollected Money</TableCell>
            <TableCell>COD + WCOD Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <LoadingComponent />
          ) : routeData.length > 0 ? (
            routeData.map((route: any, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>{route.driverId}</TableCell>
                  <TableCell>{route.driverName}</TableCell>
                  <TableCell>{route?.delivered?.length || 0}</TableCell>
                  <TableCell>{route?.orders?.length || 0}</TableCell>
                  <TableCell>
                    ${route?.collectedCODBill?.toFixed(2) || 0}
                  </TableCell>
                  <TableCell>
                    ${route?.uncollectedCODBill?.toFixed(2) || 0}
                  </TableCell>
                  <TableCell>${route?.codBill?.toFixed(2) || 0}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <></>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
