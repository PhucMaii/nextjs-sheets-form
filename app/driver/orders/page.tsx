'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ShadowSection } from '@/app/admin/reports/styled';
import { Notification } from '@/app/utils/type';
import axios from 'axios';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { YYYYMMDDFormat, formatDateChanged } from '@/app/utils/time';
import { Order } from '@/app/admin/orders/page';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import LoadingModal from '@/app/admin/components/Modals/LoadingModal';
import NotificationPopup from '@/app/admin/components/Notification';
import { Virtuoso } from 'react-virtuoso';
import OrderComponent from '../components/OrderComponent';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';

export function CircularProgressWithLabel(props: any) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        transform: `scale(1)`,
        transformOrigin: 'center center',
        p: 1,
      }}
    >
      <CircularProgress
        color={props.color}
        variant="determinate"
        size={120}
        {...props}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          textAlign="center"
          color={`${props.color}.main`}
        >
          800 / 100
        </Typography>
      </Box>
    </Box>
  );
}

const tabs = ['Today', 'Delivered', 'Completed'];

const totalYPosition = 250;
export default function OrdersPage() {
  const [currentTab, setCurrentTab] = useState<string>('Today');
  const [datePicker, setDatePicker] = useState<string>(() => {
    // format initial date
    const dateObj = new Date();
    const formattedDate = YYYYMMDDFormat(dateObj);
    return formattedDate;
  });
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);
  
  useEffect(() => {
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - totalYPosition);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentTab, datePicker]);

  const fetchOrders = async () => {
    try {
      setIsFetching(true);
      const date = new Date();
      const today = YYYYMMDDFormat(date);
      const response = await axios.get(
        `${API_URL.DRIVER_ORDERS}?deliveryDate=${
          currentTab === 'Today' ? today : datePicker
        }`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      if (currentTab === 'Today') {
        setOrders(response.data.data.deliveryOrders);
      } else if (currentTab === 'Delivered') {
        const deliveredOrders = filterOrderByStatus(
          response.data.data.deliveryOrders,
          ORDER_STATUS.DELIVERED,
        );
        setOrders(deliveredOrders);
      } else if (currentTab === 'Completed') {
        const completedOrders = filterOrderByStatus(
          response.data.data.deliveryOrders,
          ORDER_STATUS.COMPLETED,
        );
        setOrders(completedOrders);
      }

      setIsFetching(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setIsFetching(false);
    }
  };

  const filterOrderByStatus = (orderList: Order[], status: ORDER_STATUS) => {
    const filteredOrders = orderList.filter((order: Order) => {
      return order.status === status;
    });

    return filteredOrders;
  };

  const handleDateChange = (e: any) => {
    const formattedDate = formatDateChanged(e);
    setDatePicker(formattedDate);
  };

  return (
    <Sidebar>
      <NotificationPopup 
        notification={notification}
        onClose={() => setNotification({...notification, on: false})}
      />
      <LoadingModal open={isFetching} />
      <Grid container alignItems="center">
        <Grid item xs={4}></Grid>
        <Grid item xs={4} textAlign="center">
          <Typography textAlign="center" variant="h4">
            Orders
          </Typography>
        </Grid>
        <Grid item xs={4} textAlign="right">
          <IconButton color="primary" size="large">
            <SearchIcon fontSize="large" />
          </IconButton>
        </Grid>
      </Grid>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        mt={2}
      >
        {tabs &&
          tabs.map((tab: string, index: number) => {
            return (
              <Chip
                key={index}
                sx={{ width: '100% !important' }}
                label={tab}
                color="primary"
                variant={currentTab === tab ? 'filled' : 'outlined'}
                onClick={() => setCurrentTab(tab)}
              />
            );
          })}
      </Box>
      {currentTab !== 'Today' && <Box display="flex" justifyContent="flex-end" my={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={dayjs(datePicker)}
            onChange={handleDateChange}
          />
        </LocalizationProvider>
      </Box>}
      <Grid container mt={2} spacing={2}>
        <Grid item xs={6}>
          <ShadowSection
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="center"
            alignItems="center"
          >
            <Typography color="primary" variant="h6">
              Total Orders
            </Typography>
            <CircularProgressWithLabel value={80} color="primary" />
          </ShadowSection>
        </Grid>
        <Grid item xs={6}>
          <ShadowSection
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="center"
            alignItems="center"
          >
            <Typography color="success.main" variant="h6">
              Total Orders
            </Typography>
            <CircularProgressWithLabel value={80} color="success" />
          </ShadowSection>
        </Grid>
      </Grid>
      <Virtuoso
        totalCount={orders?.length || 0}
        style={{ height: virtuosoHeight, marginTop: 2 }}
        data={orders}
        itemContent={(index) => {
          return (
            <OrderComponent
              key={index}
            />
          );
        }}
      />
    </Sidebar>
  );
}
