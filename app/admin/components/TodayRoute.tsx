import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import { Order } from '../orders/page';
import { UserRoute } from '@prisma/client';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { days } from '@/app/lib/constant';

interface IProps {
  orderData: any;
  routes: any; // all routes in that day
  date: string;
}

export default function TodayRoute({ orderData, routes, date }: IProps) {
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

  const analyzeOrders = (routeOrders: Order[]) => {
    if (!routeOrders || routeOrders.length === 0) {
      return {};
    }

    const selectedDate = new Date(date);
    const dayIndex = selectedDate.getDay();

    const wcodDay = Object.values(PAYMENT_TYPE).find((paymentType: string) => {
      if (!paymentType.includes('WCOD')) {
        return false;
      }

      const day = paymentType.split(' - ')[1];
      return day === days[dayIndex];
    });

    const deliveredOrders = routeOrders.filter((order: Order) => {
      return (
        order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.COMPLETED
      );
    });

    const codOrders = routeOrders.filter((order: Order) => {
      return (
        (order?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.preference?.paymentType === wcodDay) &&
        order.status !== ORDER_STATUS.VOID
      );
    });

    const codBill = codOrders.reduce((acc: number, order: Order) => {
      return acc + order.totalPrice;
    }, 0);

    const codCollectedOrders = routeOrders.filter((order: Order) => {
      return (
        (order?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.preference?.paymentType === wcodDay) &&
        order.status === ORDER_STATUS.COMPLETED
      );
    });

    const codCollectedBill = codCollectedOrders.reduce(
      (acc: number, order: Order) => {
        return acc + order.totalPrice;
      },
      0,
    );

    const codUncollectedOrders = routeOrders.filter((order: Order) => {
      return (
        (order?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.preference?.paymentType === wcodDay) &&
        (order.status === ORDER_STATUS.DELIVERED ||
          order.status === ORDER_STATUS.INCOMPLETED)
      );
    });

    const codUncollectedBill = codUncollectedOrders.reduce(
      (acc: number, order: Order) => {
        return acc + order.totalPrice;
      },
      0,
    );

    return {
      delivered: deliveredOrders,
      codBill,
      codCollectedBill,
      codUncollectedBill,
    };
  };

  return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Delivery Orders</TableCell>
              <TableCell>Delivered</TableCell>
              <TableCell>Collected Money</TableCell>
              <TableCell>Uncollected Money</TableCell>
              <TableCell>COD + WCOD Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.length > 0 &&
              routes.map((route: any, index: number) => {
                const routeOrders: any = filterOrderByRoute(route);
                const analysisOrders: any = analyzeOrders(routeOrders);
                return (
                  <TableRow key={index}>
                    <TableCell>{route.driverId}</TableCell>
                    <TableCell>{route.driver.name}</TableCell>
                    <TableCell>{routeOrders?.length || 0}</TableCell>
                    <TableCell>
                      {analysisOrders?.delivered?.length || 0}
                    </TableCell>
                    <TableCell>
                      ${analysisOrders?.codCollectedBill || 0}
                    </TableCell>
                    <TableCell>
                      ${analysisOrders?.codUncollectedBill || 0}
                    </TableCell>
                    <TableCell>${analysisOrders?.codBill || 0}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
  );
}
