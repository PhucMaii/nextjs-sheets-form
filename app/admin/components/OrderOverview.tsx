import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Order } from '../orders/page';
import { ORDER_STATUS } from '@/app/utils/enum';
import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { ShadowSection } from '../reports/styled';
import { IRoutes, Notification } from '@/app/utils/type';
import { primary, primaryColor } from '@/theme/color';
import { getCODData } from '@/app/utils/array';
// import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WCODInfo from './Modals/WCODInfo';
import { blueGrey } from '@mui/material/colors';

interface IProps {
  allRouteOrderData: Order[];
  lastWeekOrderData: Order[];
  orderData: Order[];
  currentRoute: any;
  setCurrentRoute: any;
  routes: any;
  currentDate: string;
  setNotification: Dispatch<SetStateAction<Notification>>;
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
  const [codData, setCodData] = useState<any>();
  const [isOpenWCODInfo, setIsOpenWCODInfo] = useState<boolean>(false);

  useEffect(() => {
    if (orderData && orderData.length > 0) {
      handleGetCODData();
    }
  }, [orderData, currentDate]);

  const handleGetCODData = async () => {
    const analysisCODOrders = await getCODData(orderData, currentDate);
    setCodData(analysisCODOrders);
  };

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

  return (
    <ShadowSection sx={{ backgroundColor: 'white !important' }}>
      <WCODInfo
        open={isOpenWCODInfo}
        onClose={() => setIsOpenWCODInfo(false)}
        orderData={orderData}
        routes={routes}
        date={currentDate}
        setNotification={() => {}}
      />
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
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5">COD + WCOD</Typography>
            <IconButton
              sx={{ color: blueGrey[300] }}
              onClick={() => setIsOpenWCODInfo(true)}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Box>
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
                {codData?.uncollectedCODOrders?.length || 0}
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
                {codData?.uncollectedCODBill?.toFixed(2) || 0}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ShadowSection>
  );
}
