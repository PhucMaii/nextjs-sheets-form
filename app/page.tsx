'use client';
import React, { useEffect, useState } from 'react';
import AuthenGuard from './HOC/AuthenGuard';
import Sidebar from './components/Sidebar/Sidebar';
import { Box, Divider, Grid, Typography } from '@mui/material';
import { blue, blueGrey } from '@mui/material/colors';
import { useSession } from 'next-auth/react';
import OverviewCard from './admin/components/OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { limitOrderHour } from './lib/constant';
import OrderAccordion from './components/OrderAccordion';
import axios from 'axios';
import { API_URL } from './utils/enum';
import { Notification, UserType } from './utils/type';
import NotificationPopup from './admin/components/Notification';
import { Order } from './admin/orders/page';
import { YYYYMMDDFormat } from './utils/time';

export default function MainPage() {
  const [client, setClient] = useState<UserType | null>();
  const [isTomorrow, setIsTomorrow] = useState<boolean>(() => {
     // format initial date
     const dateObj = new Date();
     // if current hour is greater limit hour, then tomorrrow is more concern
     if (dateObj.getHours() >= limitOrderHour) {
       return true;
     }
     return false;
  });
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: ''
  });
  const [userOrder, setUserOrder] = useState<Order | null>(null);

  useEffect(() => {
    handleFetchUserOrder();
  }, [])

  const handleFetchUserOrder = async () => {
    try {
      const response = await axios.get(API_URL.CLIENT_ORDER);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error
        });
        return;
      }

      // format initial date
    const dateObj = new Date();
    // if current hour is greater limit hour, then recommend the next day
    if (dateObj.getHours() >= limitOrderHour) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    const formattedDate = YYYYMMDDFormat(dateObj);

    const orderToday = response.data.data.userOrders.find((order: Order) => {
      return order.deliveryDate === formattedDate;
    })
    console.log({orderToday, response: response.data.data.userOrders, formattedDate})

      setClient(response.data.data.user);
      setUserOrder({...response.data.data.user, ...orderToday});
    } catch (error: any) {
      console.log('Fail to fetch user orders: ', error);
    }
  }

  return (
    <Sidebar>
      <AuthenGuard>
        <NotificationPopup 
          notification={notification}
          onClose={() => setNotification({...notification, on: false})}
        />
        <Box
          sx={{
            backgroundColor: blueGrey[800],
            color: 'white',
            width: 'fit-content',
            padding: 1,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4">Hello, {client?.clientName} !</Typography>
        </Box>
        <Grid container spacing={2} my={2}>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight="bold">This month</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <OverviewCard 
              icon={<ReceiptLongIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text='Total Orders'
              value={30}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <OverviewCard 
              icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text='Balance Due'
              value={1000}
            />
          </Grid>
        </Grid>
        <Divider textAlign="left">
          <Typography variant="h6" fontWeight="bold">Order</Typography>
        </Divider>
        {userOrder && <OrderAccordion 
          order={userOrder}
        />}
      </AuthenGuard>
    </Sidebar>
  );
}