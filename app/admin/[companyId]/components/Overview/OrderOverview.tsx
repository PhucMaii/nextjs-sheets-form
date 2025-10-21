import React, { useEffect, useMemo, useState } from 'react';
import { Order } from '../../orders/page';
import { ORDER_STATUS } from '@/app/utils/enum';
import {
  AlertColor,
  Box,
  Grid,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { ShadowSection } from '../../reports/styled';
import { IRoutes } from '@/app/utils/type';
import { primary, primaryColor } from '@/theme/color';
import { getCODData } from '@/app/utils/array';
import WCODInfo from '../Modals/WCODInfo';
import AddTempCOD from '../Modals/AddTempCod/AddTempCOD';
import { minifyNumber } from '@/app/utils/number';
import { useParams } from 'next/navigation';
import MissedOrders from '../MissedOrders';

interface IProps {
  allRouteOrderData: Order[];
  lastWeekOrderData: Order[];
  orderData: Order[];
  currentRoute: any;
  setCurrentRoute: any;
  routes: any;
  currentDate: string;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function OrderOverview({
  allRouteOrderData,
  lastWeekOrderData,
  orderData,
  currentRoute,
  setCurrentRoute,
  routes,
  currentDate,
  showNotification,
}: IProps) {
  const { companyId }: any = useParams();
  const [codData, setCodData] = useState<any>();
  const [isOpenAddTempCOD, setIsOpenAddTempCOD] = useState<boolean>(false);
  const [isOpenWCODInfo, setIsOpenWCODInfo] = useState<boolean>(false);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (orderData && orderData.length > 0 && companyId) {
      handleGetCODData();
    }
  }, [orderData, currentDate, companyId]);

  const handleGetCODData = async () => {
    const analysisCODOrders = await getCODData(
      orderData,
      currentDate,
      companyId,
    );
    setCodData({ ...analysisCODOrders, cachedData: analysisCODOrders });
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

  const todayTotalProfit = useMemo(() => {
    return allRouteOrderData.length > 0
      ? allRouteOrderData.reduce((acc: number, order: Order) => {
          if (order.status !== ORDER_STATUS.VOID) {
            return acc + (order?.profit || 0);
          }

          return acc;
        }, 0)
      : 0;
  }, [allRouteOrderData]);

  const lastWeekTotalProfit = useMemo(() => {
    return lastWeekOrderData.length > 0
      ? lastWeekOrderData.reduce((acc: number, order: Order) => {
          if (order.status !== ORDER_STATUS.VOID) {
            return acc + (order?.profit || 0);
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
      <AddTempCOD
        open={isOpenAddTempCOD}
        onClose={() => setIsOpenAddTempCOD(false)}
        codData={codData}
        setCodData={setCodData}
        currentDate={currentDate}
        showNotification={showNotification}
      />
      <WCODInfo
        open={isOpenWCODInfo}
        onClose={() => setIsOpenWCODInfo(false)}
        orderData={orderData}
        routes={routes}
        date={currentDate}
        showNotification={showNotification}
      />
      {/* Select Routes */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <MissedOrders />
        </Box>
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
                  {route.name} - {route?.employee?.name}
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
          xs={12}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            backgroundColor: primary.lightest,
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="regular"
            sx={{ brightness: 0.5 }}
          >
            Total Gross
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            flexDirection={smDown ? 'column' : 'row'}
            gap={4}
            alignItems={smDown ? 'flex-start' : 'center'}
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
                variant="h3"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {smDown
                  ? minifyNumber(lastWeekTotalGross)
                  : lastWeekTotalGross.toFixed(2)}
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
                variant="h3"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {smDown
                  ? minifyNumber(todayTotalGross)
                  : todayTotalGross.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid
          item
          lg={3.9}
          md={5.9}
          xs={12}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            backgroundColor: primary.lightest,
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Typography variant="h5" fontWeight="regular">
            Total Profit
          </Typography>
          <Box
            display="flex"
            flexDirection={smDown ? 'column' : 'row'}
            justifyContent="space-between"
            gap={4}
            alignItems={smDown ? 'flex-start' : 'center'}
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
                variant="h3"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {smDown
                  ? minifyNumber(lastWeekTotalProfit)
                  : lastWeekTotalProfit.toFixed(2)}
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
                variant="h3"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {smDown
                  ? minifyNumber(todayTotalProfit)
                  : todayTotalProfit.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Track Bills Section */}
        <Grid
          item
          xs={12}
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
          <Typography variant="h5" fontWeight="regular">
            Current Bills
          </Typography>
          <Box
            display="flex"
            flexDirection={smDown ? 'column' : 'row'}
            justifyContent="space-between"
            gap={4}
            alignItems={smDown ? 'flex-start' : 'center'}
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
                variant="h3"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {smDown ? minifyNumber(openBill.length) : openBill.length}
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
                variant="h3"
                fontWeight="bold"
                sx={{ color: `${primaryColor} !important` }}
              >
                {smDown ? minifyNumber(totalBill) : totalBill.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>
        {/* COD Section */}
        {/* <Grid
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
                <Box display="flex" flexDirection="row" alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() =>
                      setCodData({
                        ...codData.cachedData,
                        cachedData: codData.cachedData,
                      })
                    }
                  >
                    <ReplayIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setIsOpenAddTempCOD(true)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
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
        </Grid> */}
      </Grid>
    </ShadowSection>
  );
}
