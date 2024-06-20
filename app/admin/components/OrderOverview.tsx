import { blueGrey } from '@mui/material/colors';
import React, { useEffect, useMemo, useState } from 'react';
import { Order } from '../orders/page';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ShadowSection } from '../reports/styled';
import useRoutes from '@/hooks/fetch/useRoutes';
import { days } from '@/app/lib/constant';
import { IRoutes } from '@/app/utils/type';
import { UserRoute } from '@prisma/client';
import { primaryColor } from '@/app/theme/color';

interface IProps {
  baseOrderData: Order[];
  currentDate: string;
}

export default function OrderOverview({ baseOrderData, currentDate }: IProps) {
  const date = new Date(currentDate);
  const { routes } = useRoutes(days[date.getDay()]);
  const [currentRoute, setCurrentRoute] = useState<number>(0);
  const [orderData, setOrderData] = useState<Order[]>(baseOrderData || []);

  const titleColor = blueGrey[50];
  const dataColor = 'white';

  useEffect(() => {
    if (baseOrderData) {
      setOrderData(baseOrderData);
      setCurrentRoute(0)
    }
  }, [baseOrderData]);


  useEffect(() => {
    if (currentRoute > 0) {
      filterOrderByRoute();
    } else if (baseOrderData) {
      setOrderData(baseOrderData);
    }
  }, [currentRoute]);

  const openBill = useMemo(() => {
    return orderData.filter((order: Order) => {
      return (
        order.status === ORDER_STATUS.INCOMPLETED ||
        order.status === ORDER_STATUS.DELIVERED
      );
    });
  }, [orderData]);

  const totalBill = useMemo(() => {
    return openBill.length > 0
      ? openBill.reduce((acc: number, order: Order) => {
          return acc + order.totalPrice;
        }, 0)
      : 0;
  }, [openBill]);

  const codOrders = useMemo(() => {
    return orderData.filter((order: Order) => {
      return (
        order?.preference?.paymentType === PAYMENT_TYPE.COD &&
        order.status !== ORDER_STATUS.VOID &&
        order.status !== ORDER_STATUS.COMPLETED
      );
    });
  }, [orderData]);

  const codBill = useMemo(() => {
    return codOrders.length > 0
      ? codOrders.reduce((acc: number, order: Order) => {
          return acc + order.totalPrice;
        }, 0)
      : 0;
  }, [codOrders]);

  const filterOrderByRoute = () => {
    const targetRoute = routes.find((route: IRoutes) => route.id === currentRoute);
    
    const filteredOrders = targetRoute.clients.map((client: UserRoute) => {
      const clientOrder = baseOrderData.find((order: Order) => order.userId === client.userId);
      return clientOrder;
    }).filter((order: Order) => order !== undefined);

    setOrderData(filteredOrders)
  }

  return (
    <ShadowSection sx={{ backgroundColor: `${primaryColor} !important` }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Select
          label="Routes"
          sx={{ background: 'white', width: '200px' }}
          value={currentRoute}
          onChange={(e: any) => setCurrentRoute(+e.target.value)}
        >
          <MenuItem value={0}>All</MenuItem>
          {routes &&
            routes.map((route: IRoutes) => {
              return (
                <MenuItem key={route.id} value={route.id}>
                  {route.name}
                </MenuItem>
              );
            })}
        </Select>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <RequestQuoteIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              Bill
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {openBill.length}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Open Bill
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <AttachMoneyIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              Balance Due
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {totalBill.toFixed(2)}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Balance due
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <CalendarTodayIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              COD ($)
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {codBill.toFixed(2)}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Bill
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <CalendarTodayIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              COD
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {codOrders.length}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Orders
          </Typography>
        </Box>
      </Box>
    </ShadowSection>
  );
}
