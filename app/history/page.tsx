'use client';
import React, { useEffect, useState } from 'react';
import AuthenGuard, { SplashScreen } from '../HOC/AuthenGuard';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import SelectDateRange from '../admin/components/SelectDateRange';
import { generateMonthRange } from '../utils/time';
import { Order } from '../admin/orders/page';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { Notification } from '../utils/type';
import ClientOrdersTable from '../admin/components/ClientOrdersTable';
import OrderAccordion from '../components/OrderAccordion';
import { Virtuoso } from 'react-virtuoso';

export default function HistoryPage() {
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  useEffect(() => {
    if (dateRange) {
      handleFetchClientOrders();
    }
  }, [dateRange]);

  console.log(clientOrders, 'clientOrders');
  const handleFetchClientOrders = async () => {
    try {
      const response = await axios.get(
        `${API_URL.CLIENT_ORDER}?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
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

      setClientOrders(response.data.data.userOrders);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client orders: ', error);
      setIsFetching(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch client orders: ' + error,
      });
    }
  };

  if (isFetching) {
    return <SplashScreen />;
  }

  return (
    <Sidebar>
      <AuthenGuard>
        <Grid container columnSpacing={2} alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4">History</Typography>
          </Grid>
          <Grid item xs={12} md={6} textAlign={!mdDown ? 'right' : 'left'}>
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Grid>
          <Grid item xs={12} md={10}>
            <TextField
              fullWidth
              variant="filled"
              // label="Search orders"
              placeholder="Search by invoice id or status"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid item md={2} textAlign="right"></Grid>
          <Grid item xs={12}>
            {clientOrders.length > 0 && (
              // <OrderAccordion
              //     order={order}
              // />
              <Virtuoso
                totalCount={clientOrders.length}
                style={{ height: 1000 }}
                data={clientOrders}
                itemContent={(index: number, order: Order) => (
                  <OrderAccordion key={index} order={order} />
                )}
              />
            )}
          </Grid>
        </Grid>
      </AuthenGuard>
    </Sidebar>
  );
}
