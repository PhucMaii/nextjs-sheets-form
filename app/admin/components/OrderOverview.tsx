import React, { useMemo } from 'react';
import { Order } from '../orders/page';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { Box, Grid, MenuItem, Select, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { ShadowSection } from '../reports/styled';
import { IRoutes } from '@/app/utils/type';
import { primary, primaryColor } from '@/theme/color';
import { days } from '@/app/lib/constant';

interface IProps {
  allRouteOrderData: Order[];
  lastWeekOrderData: Order[];
  orderData: Order[];
  currentRoute: any;
  setCurrentRoute: any;
  routes: any;
  currentDate: string;
}

export default function OrderOverview({
  allRouteOrderData,
  lastWeekOrderData,
  orderData,
  currentRoute,
  setCurrentRoute,
  routes,
  currentDate,
}: IProps) {
  const wcodDay = useMemo(() => {
    const date = new Date(currentDate);
    const dayIndex = date.getDay();

    return Object.values(PAYMENT_TYPE).find((paymentType: string) => {
      if (!paymentType.includes('WCOD')) {
        return false;
      }

      const day = paymentType.split(' - ')[1];
      return day === days[dayIndex];
    });
  }, [currentDate]);

  const todayTotalGross = useMemo(() => {
    return allRouteOrderData.length > 0
      ? allRouteOrderData.reduce((acc: number, order: Order) => {
          if (order.status !== ORDER_STATUS.VOID) {
            return acc + order.totalPrice;
          }

          return acc;
        }, 0)
      : 0;
  }, [allRouteOrderData]);

  const lastWeekTotalGross = useMemo(() => {
    return lastWeekOrderData.length > 0
      ? lastWeekOrderData.reduce((acc: number, order: Order) => {
          if (order.status !== ORDER_STATUS.VOID) {
            return acc + order.totalPrice;
          }

          return acc;
        }, 0)
      : 0;
  }, [lastWeekOrderData]);

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
          if (
            order.status === ORDER_STATUS.INCOMPLETED ||
            order.status === ORDER_STATUS.DELIVERED
          ) {
            return acc + order.totalPrice;
          }

          return acc;
        }, 0)
      : 0;
  }, [openBill]);

  const codOrders = useMemo(() => {
    return orderData.filter((order: Order) => {
      return (
        (order?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.preference?.paymentType === wcodDay) &&
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

  return (
    <ShadowSection sx={{ backgroundColor: 'white !important' }}>
      {/* Select Routes */}
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
                  {route.name} - {route?.driver?.name}
                </MenuItem>
              );
            })}
        </Select>
      </Box>

      <Grid
        container
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        rowGap={2}
      >
        {/* Total Gross Section */}
        <Grid
          item
          lg={3.9}
          md={5.9}
          sm={12}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            backgroundColor: primary.lightest,
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Typography variant="h5">Total Gross</Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            gap={4}
            alignItems="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={1.5}
            >
              <Box display="flex" gap={1} alignItems="center">
                <DateRangeIcon />
                <Typography variant="subtitle2">Last Week</Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {lastWeekTotalGross.toFixed(2)}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={1.5}
            >
              <Box display="flex" gap={1} alignItems="center">
                <TodayIcon />
                <Typography variant="subtitle1">Today</Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {todayTotalGross.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Track Bills Section */}
        <Grid
          item
          sm={12}
          lg={3.9}
          md={5.9}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            backgroundColor: primary.lightest,
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Typography variant="h5">Current Bills</Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            gap={4}
            alignItems="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={1.5}
            >
              <Box display="flex" gap={1} alignItems="center">
                <RequestQuoteIcon />
                <Typography variant="subtitle2">Open Bill</Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {openBill.length}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={1.5}
            >
              <Box display="flex" gap={1} alignItems="center">
                <AttachMoneyIcon />
                <Typography variant="subtitle1">Balance Due</Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {totalBill.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* COD Section */}
        <Grid
          item
          sm={12}
          lg={3.9}
          md={5.9}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            backgroundColor: primary.lightest,
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Typography variant="h5">COD + WCOD</Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            gap={4}
            alignItems="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={1.5}
            >
              <Box display="flex" gap={1} alignItems="center">
                <CalendarTodayIcon />
                <Typography variant="subtitle1">Bills</Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {codOrders.length}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={1.5}
            >
              <Box display="flex" gap={1} alignItems="center">
                <AttachMoneyIcon />
                <Typography variant="subtitle1">Amount</Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {codBill.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ShadowSection>
  );
}
