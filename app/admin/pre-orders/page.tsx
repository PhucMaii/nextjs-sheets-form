'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import AuthenGuard, { SplashScreen } from '@/app/HOC/AuthenGuard';
import { ShadowSection } from '../reports/styled';
import { Box, Button, Grid, IconButton, Tab, Tabs, TextField, Typography } from '@mui/material';
import { days } from '@/app/lib/constant';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import { blue } from '@mui/material/colors';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { Notification, OrderedItems, ScheduledOrder, UserType } from '@/app/utils/type';
import NotificationPopup from '../components/Notification';
import AddBoxIcon from '@mui/icons-material/AddBox';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import AddOrder from '../components/Modals/AddOrder';
import ScheduleOrdersTable from '../components/ScheduleOrdersTable';

export default function ScheduledOrderPage() {
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [baseOrderList, setBaseOrderList] = useState<ScheduledOrder[]>([]);
  const [orderList, setOrderList] = useState<ScheduledOrder[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedOrders, setSelectedOrders] = useState<ScheduledOrder[]>([]);

  useEffect(() => {
    fetchAllClients();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [tabIndex]);

  const addOrderUI = (newOrder: ScheduledOrder) => {
    const hasOrderExisted = baseOrderList.some((order: ScheduledOrder) => order.id === newOrder.id);

    if (!hasOrderExisted) {
      setOrderList([...orderList, newOrder]);
      setBaseOrderList([...baseOrderList, newOrder ]);
    }
  }

  const calculateTotalBill = (items: OrderedItems[]) => {
    const totalPrice = items.reduce((acc: number, item: OrderedItems) => {
      return acc + item.totalPrice;
    }, 0);

    return totalPrice;
  };

  const createScheduledOrder = async (userId: number, items: any) => {
    try {
      const totalPrice = calculateTotalBill(items);
      const response = await axios.post(API_URL.SCHEDULED_ORDER, {
        userId,
        items,
        day: days[tabIndex],
        newTotalPrice: totalPrice,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      addOrderUI(response.data.data);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to create scheduled order: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to create scheduled order: ' + error,
      });
      return;
    }
  };

  const fetchAllClients = async () => {
    try {
      const response = await axios.get(API_URL.CLIENTS);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      setClientList(response.data.data);
    } catch (error: any) {
      console.log('Fail to fetch all clients: ' + error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch all clients: ' + error,
      });
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL.SCHEDULED_ORDER}?day=${days[tabIndex]}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      setBaseOrderList(response.data.data);
      setOrderList(response.data.data);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to fetch orders: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch orders: ' + error,
      });
      setIsLoading(false);
    }
  };

  const handleDeleteOrderUI = (deletedOrder: ScheduledOrder) => {
    // update base order list
    const newBaseOrderList = baseOrderList.filter((order: ScheduledOrder) => {
      return order.id !== deletedOrder.id;
    });

    // update current displaying list
    const newOrderList = orderList.filter((order: ScheduledOrder) => {
      return order.id !== deletedOrder.id;
    });

    setBaseOrderList(newBaseOrderList);
    setOrderList(newOrderList);
  };

  const handleSelectOrder = (e: any, targetOrder: ScheduledOrder) => {
    e.preventDefault();
    const selectedOrder = selectedOrders.find((order: ScheduledOrder) => {
      return order.id === targetOrder.id;
    });

    if (selectedOrder) {
      const newSelectedOrders = selectedOrders.filter((order: ScheduledOrder) => {
        return order.id !== targetOrder.id;
      });
      setSelectedOrders(newSelectedOrders);
    } else {
      setSelectedOrders([...selectedOrders, targetOrder]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orderList.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orderList);
    }
  };

  const handleUpdateOrderUI = (updatedOrder: ScheduledOrder) => {
    // update base order list
    const newBaseOrderList = baseOrderList.map((order: ScheduledOrder) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    // update current displaying order list
    const newOrderList = orderList.map((order: ScheduledOrder) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    setBaseOrderList(newBaseOrderList);
    setOrderList(newOrderList);
  };

  return (
    <Sidebar>
      <AuthenGuard>
        <AddOrder
          open={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          clientList={clientList}
          setNotification={setNotification}
          createScheduledOrder={createScheduledOrder}
        />
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification({ ...notification, on: false })}
        />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={<ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text="Total Clients"
              // value={baseClientList.length}
              value={200}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text="No. clients use the app"
              value={200}
              // value={numberOfUserUsingApp().numberOfUsers as number}
              // helperText={`${numberOfUserUsingApp().percentage}% of total`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={
                <PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }} />
              }
              text="No. clients pay monthly"
              // helperText={`${numberOfUserPayMonthly().percentage}% of total`}
              // value={numberOfUserPayMonthly().numberOfUsers as number}
              value={200}
            />
          </Grid>
        </Grid>
        <ShadowSection>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="basic tabs"
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="fullWidth"
          >
            {days &&
              days.map((day: string, index: number) => {
                return (
                  <Tab
                    key={index}
                    id={`simple-tab-${index}`}
                    label={day}
                    aria-controls={`tabpanel-${index}`}
                    value={index}
                  />
                );
              })}
          </Tabs>
          </Box>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={2}>
              <Button fullWidth variant="outlined">Actions</Button>
            </Grid>
            <Grid item xs={9}>
              <TextField
                // variant="standard"
                fullWidth
                placeholder="Search by client name or client id"
              />
            </Grid>
            <Grid item xs={1}>
            <IconButton onClick={() => setIsAddOrderOpen(true)}>
                <AddBoxIcon sx={{ color: blue[500], fontSize: 50 }} />
              </IconButton>
            </Grid>
          </Grid>
          {isLoading ? (
            <SplashScreen />
          ) : orderList.length > 0 ? (
            <>
              <ScheduleOrdersTable
                handleDeleteOrderUI={handleDeleteOrderUI}
                handleUpdateOrderUI={handleUpdateOrderUI}
                clientOrders={orderList}
                setNotification={setNotification}
                selectedOrders={selectedOrders}
                handleSelectOrder={handleSelectOrder}
                handleSelectAll={handleSelectAll}
              />
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              mt={2}
            >
              <Typography variant="h6" fontWeight="bold">
                Add schedule order
              </Typography>
              <IconButton onClick={() => setIsAddOrderOpen(true)}>
                <AddBoxIcon sx={{ color: blue[500], fontSize: 50 }} />
              </IconButton>
            </Box>
          )}
        </ShadowSection>
      </AuthenGuard>
    </Sidebar>
  );
}
