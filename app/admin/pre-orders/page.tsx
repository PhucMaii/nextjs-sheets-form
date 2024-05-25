'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { SplashScreen } from '@/app/HOC/AuthenGuard';
import { ShadowSection } from '../reports/styled';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { days } from '@/app/lib/constant';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import { blue } from '@mui/material/colors';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import {
  Notification,
  OrderedItems,
  IRoutes,
  ScheduledOrder,
} from '@/app/utils/type';
import NotificationPopup from '../components/Notification';
import AddBoxIcon from '@mui/icons-material/AddBox';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import AddOrder from '../components/Modals/AddOrder';
import ScheduleOrdersTable from '../components/ScheduleOrdersTable';
import useDebounce from '@/hooks/useDebounce';
import ErrorComponent from '../components/ErrorComponent';
import DeleteIcon from '@mui/icons-material/Delete';
import { errorColor, infoBackground, infoColor } from '@/app/theme/color';
import EditDeliveryDate from '../components/Modals/EditDeliveryDate';
import { pusherClient } from '@/app/pusher';
import { Order } from '../orders/page';
import AddRoute from '../components/Modals/AddRoute';
import useSWR from 'swr';
import { UserRoute } from '@prisma/client';
import EditRoute from '../components/Modals/EditRoute';
import DeleteModal from '../components/Modals/DeleteModal';

export default function ScheduledOrderPage() {
  const [baseOrderList, setBaseOrderList] = useState<ScheduledOrder[]>([]);
  // const [clientList, setClientList] = useState<UserType[]>([]);
  const [createdOrders, setCreatedOrders] = useState<Order[]>([]);
  // const [driverList, setDriverList] = useState<Driver[]>([]);
  const [preOrderProgress, setPreOrderProgress] = useState<number>(0);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditRouteOpen, setIsEditRouteOpen] = useState<boolean>(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [orderList, setOrderList] = useState<ScheduledOrder[]>([]);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const [routes, setRoutes] = useState<IRoutes[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<ScheduledOrder[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const { data: clientList } = useSWR(API_URL.CLIENTS);
  const { data: driverList } = useSWR(API_URL.DRIVERS);
  // const { data: routes, isValidating } = useSWR(
  //   `${API_URL.ROUTES}?day=${days[dayIndex]}`,
  // );

  useEffect(() => {
    if (preOrderProgress === 100) {
      setTimeout(() => {
        setIsPreOrderOpen(false);
        setPreOrderProgress(0);
      }, 1000);
    }
  }, [preOrderProgress]);

  useEffect(() => {
    // fetchDrivers();
    // fetchAllClients();
    pusherClient.subscribe('admin-schedule-order');

    const handleReceiveOrder = (incomingOrder: Order) => {
      const sameIdOrder = createdOrders.some(
        (order: Order) => order.id === incomingOrder.id,
      );

      if (!sameIdOrder) {
        setCreatedOrders((prevOrders) => [...prevOrders, incomingOrder]);
      }
    };
    pusherClient.bind('pre-order', handleReceiveOrder);

    return () => {
      pusherClient.unsubscribe('admin-schedule-order');
    };
  }, []);

  useEffect(() => {
    if (selectedOrders.length > 0) {
      // Filter out item has same id
      const filteredOrderLength = createdOrders.reduce(
        (accumulator: any, currentOrder: Order) => {
          const foundItem = accumulator.find((order: Order) => {
            return order.id === currentOrder.id;
          });

          if (!foundItem) {
            accumulator = accumulator.concat(currentOrder);
          }

          return accumulator;
        },
        [],
      );
      setPreOrderProgress(
        (filteredOrderLength.length / selectedOrders.length) * 100,
      );
    }
  }, [createdOrders]);

  useEffect(() => {
    fetchRoutes();
  }, [dayIndex]);

  useEffect(() => {
    if (routes.length > 0) {
      fetchOrders();
    }
  }, [routes, routeIndex]);

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
    const hasOrderExisted = baseOrderList.some(
      (order: ScheduledOrder) => order.id === newOrder.id,
    );

    if (!hasOrderExisted) {
      setOrderList([...orderList, newOrder]);
      setBaseOrderList([...baseOrderList, newOrder]);
    }
  };

  const calculateTotalBill = useCallback((): string => {
    const totalPrice = orderList.reduce(
      (acc: number, order: ScheduledOrder) => {
        return acc + order.totalPrice;
      },
      0,
    );

    return totalPrice.toFixed(2);
  }, [orderList]);

  const calculateTotalClient = useCallback((): number => {
    const trackClients: ScheduledOrder[] = [];
    const clients = orderList.filter((order: ScheduledOrder) => {
      const isExistedClient = trackClients.find(
        (foundOrder: ScheduledOrder) =>
          order.user.clientId === foundOrder.user.clientId,
      );

      if (!isExistedClient) {
        trackClients.push(order);
        return true;
      } else {
        return false;
      }
    }, 0);

    return clients.length;
  }, [orderList]);

  const calculateTotalBillOneOrder = (items: OrderedItems[]) => {
    const totalPrice = items.reduce((acc: number, item: OrderedItems) => {
      return acc + item.totalPrice;
    }, 0);

    return totalPrice;
  };

  const createScheduledOrder = async (userId: number, items: any) => {
    try {
      const totalPrice = calculateTotalBillOneOrder(items);
      const response = await axios.post(API_URL.SCHEDULED_ORDER, {
        userId,
        items,
        day: days[dayIndex],
        routeId: routes[routeIndex].id,
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

  const deleteRoute = async (targetRoute: IRoutes) => {
    try {
      const response = await axios.delete(
        `${API_URL.ROUTES}?routeId=${targetRoute.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      const newRoutes = routes.filter((route: IRoutes) => {
        return route.id !== targetRoute.id;
      });

      setRoutes(newRoutes);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
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
      console.log('Fail to delete selected orders: ', error);
    }
  };

  // const fetchAllClients = async () => {
  //   try {
  //     const response = await axios.get(API_URL.CLIENTS);

  //     if (response.data.error) {
  //       setNotification({
  //         on: true,
  //         type: 'error',
  //         message: response.data.error,
  //       });
  //       return;
  //     }

  //     setClientList(response.data.data);
  //   } catch (error: any) {
  //     console.log('Fail to fetch all clients: ' + error);
  //     setNotification({
  //       on: true,
  //       type: 'error',
  //       message: 'Fail to fetch all clients: ' + error,
  //     });
  //   }
  // };

  // const fetchDrivers = async () => {
  //   try {
  //     const response = await axios.get(API_URL.DRIVERS);

  //     if (response.data.error) {
  //       setNotification({
  //         on: true,
  //         type: 'error',
  //         message: response.data.error,
  //       });
  //       return;
  //     }

  //     setDriverList(response.data.data);
  //   } catch (error: any) {
  //     console.log('Fail to fetch all clients: ' + error);
  //     setNotification({
  //       on: true,
  //       type: 'error',
  //       message: 'Fail to fetch all clients: ' + error,
  //     });
  //   }
  // };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // const returnRoutes = await fetchRoutes();
      if (routes.length === 0) {
        setOrderList([]);
        setIsLoading(false);
        return;
      }
      const clientIds = routes[routeIndex].clients?.map(
        (userRoute: UserRoute) => {
          return userRoute.userId;
        },
      );
      const response = await axios.get(
        `${API_URL.SCHEDULED_ORDER}?day=${days[dayIndex]}&clientList=${clientIds}`,
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

  const fetchRoutes = async () => {
    try {
      setIsFetchingRoute(true);
      const response = await axios.get(
        `${API_URL.ROUTES}?day=${days[dayIndex]}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetchingRoute(false);
        return;
      }

      setIsFetchingRoute(false);
      setRoutes(response.data.data);
      return response.data.data; // for fetch orders
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsFetchingRoute(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error,
      });
    }
  };

  const handleAddRouteUI = (targetRoute: IRoutes) => {
    setRoutes([...routes, targetRoute]);
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
      const newSelectedOrders = selectedOrders.filter(
        (order: ScheduledOrder) => {
          return order.id !== targetOrder.id;
        },
      );
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

  const handleUpdateRouteUI = (targetRoute: IRoutes) => {
    const newRoutes = routes.map((route: IRoutes) => {
      if (route.id === targetRoute.id) {
        return targetRoute;
      }
      return route;
    });

    setRoutes(newRoutes);
  };

  const switchDay = (newValue: number) => {
    setRouteIndex(0);
    setDayIndex(newValue);
    setRoutes([]);
  };

  return (
    <Sidebar>
      {/* <AuthenGuard> */}
      <AddOrder
        open={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        clientList={clientList?.data || []}
        setNotification={setNotification}
        createScheduledOrder={createScheduledOrder}
      />
      <AddRoute
        open={isAddRouteOpen}
        onClose={() => setIsAddRouteOpen(false)}
        day={days[dayIndex]}
        driverList={driverList?.data || []}
        clientList={clientList?.data || []}
        setNotification={setNotification}
        handleAddRouteUI={handleAddRouteUI}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        handleCloseModal={() => setIsDeleteModalOpen(false)}
        handleDelete={deleteRoute}
        targetObj={routes[routeIndex]}
      />
      <EditDeliveryDate
        open={isPreOrderOpen}
        onClose={() => setIsPreOrderOpen(false)}
        isPreOrder
        setNotification={setNotification}
        // handlePreOrder={handlePreOrder}
        progress={preOrderProgress}
        scheduleOrderList={selectedOrders}
      />
      {routes.length > 0 && (
        <EditRoute
          open={isEditRouteOpen}
          onClose={() => setIsEditRouteOpen(false)}
          driverList={driverList?.data || []}
          clientList={clientList?.data || []}
          day={days[dayIndex]}
          handleUpdateRouteUI={handleUpdateRouteUI}
          setNotification={setNotification}
          route={routes[routeIndex]}
        />
      )}
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <OverviewCard
            icon={<ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Total Orders"
            value={orderList.length}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <OverviewCard
            icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Total Bill"
            value={calculateTotalBill()}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <OverviewCard
            icon={<PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Total Clients"
            value={calculateTotalClient() as number}
          />
        </Grid>
      </Grid>
      <ShadowSection>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="basic tabs"
            value={dayIndex}
            onChange={(e, newValue: number) => switchDay(newValue)}
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
        <Grid container mt={3} alignItems="flex-start">
          <Grid item xs={2} alignSelf="flex-start">
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              justifyContent="center"
              alignItems="center"
            >
              <Box display="flex" gap={1}>
                <Button
                  color="error"
                  fullWidth
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="outlined"
                >
                  Delete
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setIsEditRouteOpen(true)}
                >
                  Edit
                </Button>
              </Box>
              {isFetchingRoute ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  mt={2}
                >
                  <Typography>Loading Route...</Typography>
                </Box>
              ) : routes.length > 0 ? (
                <Tabs
                  orientation="vertical"
                  aria-label="basic tabs"
                  value={routeIndex}
                  onChange={(e, newValue) => setRouteIndex(newValue)}
                  variant="fullWidth"
                  sx={{
                    '& button': { borderRadius: 2 },
                    '& button:hover': {
                      boxShadow:
                        'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
                    },
                    '& button:active': {
                      boxShadow:
                        'rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset',
                    },
                    '& button.Mui-selected': {
                      backgroundColor: infoBackground,
                      color: infoColor,
                      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px;',
                    },
                  }}
                >
                  {routes.length > 0 &&
                    routes.map((route: IRoutes, index: number) => {
                      return (
                        <Tab
                          key={index}
                          id={`simple-tab-${index}`}
                          label={`${route.name} - ${route?.driver?.name}`}
                          aria-controls={`tabpanel-${index}`}
                          value={index}
                        />
                      );
                    })}
                </Tabs>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  mt={2}
                >
                  <ErrorComponent errorText="No Routes Found" />
                </Box>
              )}
              <IconButton onClick={() => setIsAddRouteOpen(true)}>
                <AddBoxIcon sx={{ color: blue[500], fontSize: 50 }} />
              </IconButton>
            </Box>
          </Grid>
          <Grid item container alignItems="center" xs={10} spacing={1}>
            <Grid item xs={2}>
              <Button
                fullWidth
                onClick={() => setIsPreOrderOpen(true)}
                variant="outlined"
                disabled={selectedOrders.length === 0}
              >
                <Box display="flex" gap={1} alignItems="center">
                  <Typography>Pre Order</Typography>
                  <PendingActionsIcon />
                </Box>
              </Button>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                placeholder="Search by client name or client id"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <Box display="flex" alignItems="center">
                <IconButton onClick={() => setIsAddOrderOpen(true)}>
                  <AddBoxIcon sx={{ color: blue[500], fontSize: 50 }} />
                </IconButton>
                <IconButton
                  disabled={selectedOrders.length === 0}
                  onClick={() => deleteSelectedOrders()}
                >
                  <DeleteIcon sx={{ color: errorColor, fontSize: 50 }} />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <SplashScreen />
              ) : orderList.length > 0 ? (
                <ScheduleOrdersTable
                  handleDeleteOrderUI={handleDeleteOrderUI}
                  handleUpdateOrderUI={handleUpdateOrderUI}
                  clientOrders={orderList}
                  setNotification={setNotification}
                  selectedOrders={selectedOrders}
                  handleSelectOrder={handleSelectOrder}
                  handleSelectAll={handleSelectAll}
                  routeId={routes[routeIndex]?.id || -1}
                  routes={routes}
                />
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  mt={2}
                >
                  <ErrorComponent errorText="No Scheduled Order Found" />
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>
      </ShadowSection>
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
