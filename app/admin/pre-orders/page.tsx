'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import AuthenGuard, { SplashScreen } from '@/app/HOC/AuthenGuard';
import { ShadowSection } from '../reports/styled';
import { Box, Button, Grid, IconButton, Menu, MenuItem, Tab, Tabs, TextField, Typography } from '@mui/material';
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import useDebounce from '@/hooks/useDebounce';
import ErrorComponent from '../components/ErrorComponent';
import DeleteIcon from '@mui/icons-material/Delete';
import { DropdownItemContainer } from '../orders/styled';
import { errorColor } from '@/app/theme/color';

export default function ScheduledOrderPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
  useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
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
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    fetchAllClients();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [tabIndex]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = orderList.filter((order: ScheduledOrder) => {
        if (
          order.user.clientId.includes(debouncedKeywords) ||
          order.user.clientName
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
      setOrderList(newOrderList);
    } else {
      setOrderList(baseOrderList);
    }
  }, [debouncedKeywords, baseOrderList]);

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

  const deleteSelectedOrders = async () => {
    try {
      const response = await axios.delete(API_URL.SCHEDULED_ORDER, {
        data: { scheduleOrderList: selectedOrders },
      });
      await fetchOrders();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
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

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
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

  const actionDropdown = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <Button
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        disabled={selectedOrders.length === 0}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
        endIcon={<ArrowDownwardIcon />}
        variant="outlined"
        fullWidth
      >
        Actions
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={actionButtonAnchor}
        open={openDropdown}
        onClose={handleCloseAnchor}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            deleteSelectedOrders();
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <DeleteIcon sx={{ color: errorColor }} />
            <Typography sx={{color: errorColor}}>Delete</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

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
              {/* <Button fullWidth variant="outlined">Actions</Button> */}
              {actionDropdown}
            </Grid>
            <Grid item xs={9}>
              <TextField
                // variant="standard"
                fullWidth
                placeholder="Search by client name or client id"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
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
              <ErrorComponent errorText='No Scheduled Order Found' />
            </Box>
          )}
        </ShadowSection>
      </AuthenGuard>
    </Sidebar>
  );
}
