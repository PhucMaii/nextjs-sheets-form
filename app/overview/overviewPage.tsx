'use client';
import React, { useState, useEffect } from 'react';
import { limitOrderHour } from '../lib/constant';
import { Order } from '../admin/[companyId]/orders/page';
import { UserType } from '../utils/type';
import axios from 'axios';
import { API_URL, ORDER_STATUS } from '../utils/enum';
import { YYYYMMDDFormat, generateMonthRange } from '../utils/time';
import Sidebar from '../components/Sidebar';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import { Box, Divider, Grid, IconButton, Typography } from '@mui/material';
import OverviewCard from '../admin/[companyId]/components/OverviewCard/OverviewCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { blue, blueGrey } from '@mui/material/colors';
import OrderAccordion from '../components/OrderAccordion';
import { useRouter } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import { SWRFetchData } from '../utils/db';

export default function MainPage() {
  const [client, setClient] = useState<UserType | null>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isTomorrow, setIsTomorrow] = useState<boolean>(() => {
    // format initial date
    const dateObj = new Date();
    // if current hour is greater limit hour, then tomorrrow is more concern
    if (dateObj.getHours() >= limitOrderHour) {
      return true;
    }
    return false;
  });
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [thisMonthOrders, setThisMonthOrders] = useState<Order[]>([]);
  // const [totalBill, setTotalBill] = useState<number>(0);

  const router: any = useRouter();
  const { showNotification, NotificationComp } = useNotification();

  const dateRange = generateMonthRange();

  // set date to tomorrow
  const today = new Date();
  const endDate = dateRange[1];
  endDate.setDate(today.getDate() + 2);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clientOrders, _mutate, isValidating] = SWRFetchData(
    `${API_URL.CLIENT_ORDER}?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  useEffect(() => {
    if (clientOrders) {
      initializeUser();
    }
  }, [clientOrders]);

  // useEffect(() => {
  //   if (thisMonthOrders.length > 0) {
  //     calculateTotalBill();
  //   }
  // }, [thisMonthOrders]);

  // const calculateTotalBill = () => {
  //   const total = thisMonthOrders.reduce((acc: number, order: Order) => {
  //     return acc + order.totalPrice;
  //   }, 0);

  //   setTotalBill(total);
  // };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      const response = await axios.put(`${API_URL.CLIENT_ORDER}/status`, {
        orderId,
        updatedStatus: ORDER_STATUS.VOID,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      const newThisMonthOrders = thisMonthOrders.filter((order: Order) => {
        return order.id !== orderId;
      });

      showNotification('success', response.data.message);

      const newUserOrders = userOrders.filter(
        (order: Order) => order.id !== orderId,
      );
      setUserOrders(newUserOrders);
      setThisMonthOrders(newThisMonthOrders);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Fail to delete the order: ' + error);
    }
  };

  const initializeUser = () => {
    const dateObj = new Date();
    if (dateObj.getHours() >= limitOrderHour) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    const formattedDate = YYYYMMDDFormat(dateObj);
    const userOrderList = clientOrders.data.userOrders;
    const orderToday = userOrderList
      .filter((order: Order) => {
        return order.deliveryDate === formattedDate;
      })
      .map((order: Order) => {
        return { ...clientOrders.data.user, ...order };
      });

    setClient(clientOrders.data.user);
    setUserOrders(orderToday);

    const orderList = filterDateRangeOrders(
      clientOrders.data.userOrders,
      dateRange[0],
      dateRange[1],
    );

    setThisMonthOrders(orderList);
  };

  const handleUpdateOrderUI = (updatedOrder: Order) => {
    const newOrders = thisMonthOrders.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    const todayOrders = userOrders.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    setThisMonthOrders(newOrders);
    setUserOrders(todayOrders);
  };

  if (isValidating && !clientOrders) {
    return (
      <Sidebar>
        <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
          <LoadingComponent />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {/* <AuthenGuard> */}
      {NotificationComp}
      <Box
        sx={{
          backgroundColor: blueGrey[800],
          color: 'white',
          width: 'fit-content',
          padding: 1,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5">Hello, {client?.clientName} !</Typography>
      </Box>
      <Grid container spacing={2} my={2}>
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold">
            This month
          </Typography>
        </Grid>
        {/* <Grid item xs={12} md={6}>
          <OverviewCard
            icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Balance Due"
            value={totalBill?.toFixed(2)}
            onClick={() => router.push('/history')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverviewCard
            icon={<ReceiptLongIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Total Orders"
            value={thisMonthOrders.length}
            onClick={() => router.push('/history')}
          />
        </Grid> */}
        <Grid item xs={12}>
          <OverviewCard
            text="Over Due"
            value={clientOrders?.data?.dueAmount?.toFixed(2) || 0}
            icon={
              <AttachMoneyIcon
                sx={{ fontSize: 50 }}
                fontSize="large"
                color="primary"
              />
            }
          />
        </Grid>
        <Grid item xs={6}>
          <OverviewCard
            text="Current Month ($)"
            value={clientOrders?.data?.currentMonthBill?.toFixed(2) || 0}
            // icon={<MonetizationOnIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={6}>
          <OverviewCard
            text="Total Orders"
            value={thisMonthOrders.length}
            // icon={<ReceiptLongIcon sx={{fontSize: 50}} fontSize="large" color="primary" />}
          />
        </Grid>
      </Grid>
      <Divider textAlign="left">
        <Typography variant="h6" fontWeight="bold">
          Order
        </Typography>
      </Divider>
      {userOrders.length > 0 ? (
        userOrders.map((order: Order) => (
          <OrderAccordion
            key={order.id}
            handleDeleteOrder={handleDeleteOrder}
            order={order}
            showNotification={showNotification}
            handleUpdateOrderUI={handleUpdateOrderUI}
            isEdit
          />
        ))
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          mt={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Create an order for {isTomorrow ? 'tomorrow' : 'today'}
          </Typography>
          <IconButton onClick={() => router.push('/order')}>
            <AddBoxIcon sx={{ color: blue[500], fontSize: 50 }} />
          </IconButton>
        </Box>
      )}
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
