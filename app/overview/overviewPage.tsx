'use client';
import React, { useState, useEffect } from 'react';
import { limitOrderHour } from '../lib/constant';
import { Order } from '../admin/orders/page';
import { Notification, UserType } from '../utils/type';
import axios from 'axios';
import { API_URL, ORDER_STATUS } from '../utils/enum';
import { YYYYMMDDFormat, generateMonthRange } from '../utils/time';
import Sidebar from '../components/Sidebar/Sidebar';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import AuthenGuard from '../HOC/AuthenGuard';
import NotificationPopup from '../admin/components/Notification';
import { Box, Divider, Grid, IconButton, Typography } from '@mui/material';
import OverviewCard from '../admin/components/OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { blue, blueGrey } from '@mui/material/colors';
import OrderAccordion from '../components/OrderAccordion';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const [client, setClient] = useState<UserType | null>();
  const [isFetching, setIsFetching] = useState<boolean>(true);
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
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [userOrder, setUserOrder] = useState<Order | null>(null);
  const [thisMonthOrders, setThisMonthOrders] = useState<Order[]>([]);
  const [totalBill, setTotalBill] = useState<number>(0);
  const router: any = useRouter();

  useEffect(() => {
    handleFetchUserOrder();
  }, []);

  useEffect(() => {
    if (thisMonthOrders.length > 0) {
      calculateTotalBill();
    }
  }, [thisMonthOrders]);

  const calculateTotalBill = () => {
    const total = thisMonthOrders.reduce((acc: number, order: Order) => {
      return acc + order.totalPrice;
    }, 0);

    setTotalBill(total);
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      const response = await axios.put(`${API_URL.CLIENT_ORDER}/status`, {
        orderId,
        updatedStatus: ORDER_STATUS.VOID,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      const newThisMonthOrders = thisMonthOrders.filter((order: Order) => {
        return order.id !== orderId;
      });

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setUserOrder(null);
      setThisMonthOrders(newThisMonthOrders);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to delete the order: ' + error,
      });
    }
  };

  const handleFetchUserOrder = async () => {
    try {
      setIsFetching(true);
      const dateRange = generateMonthRange();

      // set date to tomorrow
      const today = new Date();
      const endDate = dateRange[1];
      endDate.setDate(today.getDate() + 1);
      const response = await axios.get(
        `${API_URL.CLIENT_ORDER}?startDate=${dateRange[0]}&endDate=${endDate}`,
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

      const dateObj = new Date();
      if (dateObj.getHours() >= limitOrderHour) {
        dateObj.setDate(dateObj.getDate() + 1);
      }
      const formattedDate = YYYYMMDDFormat(dateObj);
      const userOrderList = response.data.data.userOrders;
      const orderToday = userOrderList.find((order: Order) => {
        return order.deliveryDate === formattedDate;
      });

      setClient(response.data.data.user);
      setUserOrder({ ...response.data.data.user, ...orderToday });
      setThisMonthOrders(response.data.data.userOrders);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch user orders: ', error);
      setIsFetching(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch user orders: ' + error,
      });
    }
  };

  if (isFetching) {
    return (
      <Sidebar>
        <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
          <LoadingComponent color="blue" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <AuthenGuard>
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification({ ...notification, on: false })}
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
            <Typography variant="h6" fontWeight="bold">
              This month
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <OverviewCard
              icon={<ReceiptLongIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text="Total Orders"
              value={thisMonthOrders.length}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <OverviewCard
              icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text="Balance Due"
              value={totalBill}
            />
          </Grid>
        </Grid>
        <Divider textAlign="left">
          <Typography variant="h6" fontWeight="bold">
            Order
          </Typography>
        </Divider>
        {userOrder?.items ? (
          <OrderAccordion
            handleDeleteOrder={handleDeleteOrder}
            order={userOrder}
            setNotification={setNotification}
            isEdit
          />
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
      </AuthenGuard>
    </Sidebar>
  );
}
