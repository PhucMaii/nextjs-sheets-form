'use client';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { SplashScreen } from '@/HOC/AuthenGuard';
import { ShadowSection } from '../reports/styled';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Fab,
  FormControlLabel,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { days, limitOrderHour, limitOrderMinutes } from '@/app/lib/constant';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import { blue } from '@mui/material/colors';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { OrderedItems, IRoutes, ScheduledOrder } from '@/app/utils/type';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import AddOrder from '../components/Modals/add/AddOrder';
import useDebounce from '@/hooks/useDebounce';
import ErrorComponent from '../components/ErrorComponent';
import DeleteIcon from '@mui/icons-material/Delete';
import { infoBackground, infoColor } from '@/theme/color';
import EditDeliveryDate from '../components/Modals/edit/EditDeliveryDate';
import AddRoute from '../components/Modals/add/AddRoute';
import { UserRoute } from '@prisma/client';
import EditRoute from '../components/Modals/edit/EditRoute';
import DeleteModal from '../components/Modals/delete/DeleteModal';
import ScheduleOrder from '../components/Reorder/ScheduleOrder';
import AddIcon from '@mui/icons-material/Add';
import { SWRFetchData } from '@/app/utils/db';
import { YYYYMMDDFormat } from '@/app/utils/time';
import useNotification from '@/hooks/useNotification';
import ReArrangementModal from '../components/Modals/ReArrangementModal';
import VerifiedIcon from '@mui/icons-material/Verified';
import { checkIsPreOrderQualified } from '@/app/utils/orders';
import { useParams } from 'next/navigation';

export default function ScheduledOrderPage() {
  const { companyId }: any = useParams();

  const [baseOrderList, setBaseOrderList] = useState<ScheduledOrder[]>([]);
  // const [preOrderProgress, setPreOrderProgress] = useState<number>(0);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditRouteOpen, setIsEditRouteOpen] = useState<boolean>(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [isSavingArrangement, setIsSavingArrangement] =
  //   useState<boolean>(false);
  const [isOpenReArrangement, setIsOpenReArrangement] =
    useState<boolean>(false);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState<boolean>(false);
  const [orderList, setOrderList] = useState<ScheduledOrder[]>([]);
  const [dayIndex, setDayIndex] = useState<number>(() => {
    const dateObj = new Date();
    const pstTime = dateObj.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
    });
    const hour = Number(pstTime.split(', ')[1].split(':')[0]);
    const minute = Number(pstTime.split(', ')[1].split(':')[1]);
    // if current hour is greater limit hour, then recommend the next day
    if (hour > limitOrderHour) {
      dateObj.setDate(dateObj.getDate() + 1);
    }

    if (hour === limitOrderHour) {
      if (minute > limitOrderMinutes) {
        dateObj.setDate(dateObj.getDate() + 1);
      }
    }

    return dateObj.getDay();
  });
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const [routes, setRoutes] = useState<IRoutes[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<ScheduledOrder[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const { showNotification, NotificationComp } = useNotification();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const recommendDate = useMemo(() => {
    // format initial date
    const dateObj = new Date();
    // if current hour is greater limit hour, then recommend the next day
    const pstTime = dateObj.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
    });
    const hour = Number(pstTime.split(', ')[1].split(':')[0]);
    const minute = Number(pstTime.split(', ')[1].split(':')[1]);
    // if current hour is greater limit hour, then recommend the next day
    if (hour > limitOrderHour) {
      dateObj.setDate(dateObj.getDate() + 1);
    }

    if (hour === limitOrderHour) {
      if (minute > limitOrderMinutes) {
        dateObj.setDate(dateObj.getDate() + 1);
      }
    }

    const formattedDate = YYYYMMDDFormat(dateObj);

    return { day: days[dateObj.getDay()], deliveryDate: formattedDate };
  }, []);
  // Data Fetching
  const [routesResponse] = SWRFetchData(
    getAdminApiUrl(companyId, `/routes?day=${days[dayIndex]}`),
  );

  const clientIds = routesResponse?.data[routeIndex]?.clients?.map(
    (userRoute: UserRoute) => {
      return userRoute.userId;
    },
  );
  // const [orders, mutateOrders] = SWRFetchData(
  //   `${API_URL.SCHEDULED_ORDER}?day=${days[dayIndex]}&clientList=${clientIds || []}&deliveryDate=${recommendDate.day === days[dayIndex] ? recommendDate.deliveryDate : ''}`,
  // );
  const [orders, mutateOrders] = SWRFetchData(
    getAdminApiUrl(companyId, `/scheduledOrders?day=${days[dayIndex]}&clientList=${clientIds || []}&deliveryDate=${recommendDate.day === days[dayIndex] ? recommendDate.deliveryDate : ''}`),
  );
  const [drivers] = SWRFetchData(getAdminApiUrl(companyId, '/drivers'));
  const [clients, mutateClients] = SWRFetchData(
    getAdminApiUrl(companyId, `/clients?dayRoute=${days[dayIndex]}`),
  );

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  useEffect(() => {
    if (orders && routes && routes?.length > 0) {
      // fetchOrders();
      initializeOrders();
    } else {
      setOrderList([]);
      setIsLoading(false);
    }
  }, [routes, routeIndex, orders]);

  // useEffect(() => {
  //   if (preOrderProgress === 100) {
  //     setTimeout(() => {
  //       setIsPreOrderOpen(false);
  //       setPreOrderProgress(0);
  //     }, 1000);
  //   }
  // }, [preOrderProgress]);
  // useEffect(() => {
  //   if (selectedOrders.length > 0) {
  //     // Filter out item has same id
  //     const filteredOrderLength = createdOrders.reduce(
  //       (accumulator: any, currentOrder: Order) => {
  //         const foundItem = accumulator.find((order: Order) => {
  //           return order?.id === currentOrder.id;
  //         });

  //         if (!foundItem) {
  //           accumulator = accumulator.concat(currentOrder);
  //         }

  //         return accumulator;
  //       },
  //       [],
  //     );
  //     setPreOrderProgress(
  //       (filteredOrderLength.length / selectedOrders.length) * 100,
  //     );
  //   }
  // }, [createdOrders]);

  useEffect(() => {
    if (routesResponse) {
      initializeRoutes();
    }
  }, [dayIndex, routesResponse]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = baseOrderList.filter((order: ScheduledOrder) => {
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

  // const addOrderUI = (newOrder: ScheduledOrder) => {
  //   const hasOrderExisted = baseOrderList.some(
  //     (order: ScheduledOrder) => order.id === newOrder.id,
  //   );

  //   if (!hasOrderExisted) {
  //     const newBaseOrderList = insertInSortedIdArray(baseOrderList, newOrder);
  //     setOrderList(newBaseOrderList);
  //     setBaseOrderList(newBaseOrderList);
  //   } else {
  //     const newOrderList = orderList.map((order: ScheduledOrder) => {
  //       if (order.id === newOrder.id) {
  //         return newOrder;
  //       }
  //       return order;
  //     });

  //     const newBaseOrderList = baseOrderList.map((order: ScheduledOrder) => {
  //       if (order.id === newOrder.id) {
  //         return newOrder;
  //       }
  //       return order;
  //     });

  //     setOrderList(newOrderList);
  //     setBaseOrderList(newBaseOrderList);
  //     mutateOrders();
  //   }
  // };

  const calculateTotalBill = useCallback((): string => {
    const totalPrice = orderList.reduce(
      (acc: number, order: ScheduledOrder) => {
        return acc + order.totalPrice;
      },
      0,
    );

    return totalPrice.toFixed(2);
  }, [orderList]);

  const calculateToCreateOrders = useCallback(() => {
    const toCreateOrders = orderList.filter((order: ScheduledOrder) => {
      const isQualified = checkIsPreOrderQualified(order);

      return isQualified;
    });

    return toCreateOrders.length;
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
      const response = await axios.post(
        getAdminApiUrl(companyId, '/scheduledOrders'),
        {
          userId,
          items,
          day: days[dayIndex],
          routeId: routes[routeIndex].id,
          newTotalPrice: totalPrice,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      mutateOrders();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to create scheduled order: ', error);
      showNotification('error', 'Fail to create scheduled order: ' + error);
      return;
    }
  };

  const deleteRoute = async (targetRoute: IRoutes) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/routes?routeId=${targetRoute.id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      mutateClients();

      const newRoutes = routes.filter((route: IRoutes) => {
        return route.id !== targetRoute.id;
      });

      if (newRoutes.length > 0) {
        setRouteIndex(0);
      }

      setRoutes(newRoutes);
      showNotification('success', response.data.message);
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
    }
  };

  const deleteSelectedOrders = async () => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, '/scheduledOrders'),
        {
          data: {
            scheduleOrderList: selectedOrders,
            routeId: routes[routeIndex].id,
        },
      });
      mutateOrders();

      setSelectedOrders([]);
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete selected orders: ', error);
    }
  };

  const initializeOrders = () => {
    console.log('orders', orders);
    setBaseOrderList(orders?.data);
    setOrderList(orders?.data);
  };

  const initializeRoutes = () => {
    setRoutes(routesResponse?.data);
    setIsFetchingRoute(false);
  };

  const onAddRouteUI = (targetRoute: IRoutes) => {
    setRoutes([...routes, targetRoute]);
    // mutate(`${API_URL.CLIENTS}?dayRoute=${days[dayIndex]}`);
    mutateClients();
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

  console.log('orderList', orderList);

  // const handleUpdateOrderUI = (updatedOrder: ScheduledOrder) => {
  //   // update base order list
  //   const newBaseOrderList = baseOrderList.map((order: ScheduledOrder) => {
  //     if (order.id === updatedOrder.id) {
  //       return updatedOrder;
  //     }
  //     return order;
  //   });

  //   // update current displaying order list
  //   const newOrderList = orderList.map((order: ScheduledOrder) => {
  //     if (order.id === updatedOrder.id) {
  //       return updatedOrder;
  //     }
  //     return order;
  //   });

  //   // Update selected orders if any
  //   const newSelectedOrders = selectedOrders.map((order: ScheduledOrder) => {
  //     if (order.id === updatedOrder.id) {
  //       return updatedOrder;
  //     }
  //     return order;
  //   });

  //   setSelectedOrders(newSelectedOrders);
  //   setBaseOrderList(newBaseOrderList);
  //   setOrderList(newOrderList);
  // };

  // const handleUpdateRouteUI = (targetRoute: IRoutes) => {
  //   const newRoutes = routes.map((route: IRoutes) => {
  //     if (route.id === targetRoute.id) {
  //       return targetRoute;
  //     }
  //     return route;
  //   });

  //   // mutate(`${API_URL.CLIENTS}?dayRoute=${days[dayIndex]}`);
  //   // fetchRoutes();
  //   setRoutes(newRoutes);
  // };

  // const saveOrderArrangement = async () => {
  //   try {
  //     setIsSavingArrangement(true);
  //     const newListWithId = orderList.map(
  //       (order: ScheduledOrder, index: number) => {
  //         const newOrderId = baseOrderList[index].id;
  //         return { id: order.id, newId: newOrderId };
  //       },
  //     );

  //     const updatedIdList = newListWithId.map((order: any) => order.id);

  //     const response = await axios.put(API_URL.SCHEDULED_ORDER, {
  //       removedOrderIdList: updatedIdList,
  //       updatedOrderList: newListWithId,
  //       reArrangement: true,
  //     });

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       setIsSavingArrangement(false);
  //       return;
  //     }

  //     // const newRoutes = await fetchRoutes();

  //     // await fetchOrders(newRoutes);
  //     // mutateOrders();
  //     const clientIds = routes[routeIndex].clients?.map(
  //       (userRoute: UserRoute) => {
  //         return userRoute.userId;
  //       },
  //     );

  //     mutate(
  //       `${API_URL.SCHEDULED_ORDER}?day=${days[dayIndex]}&clientList=${clientIds || []}`,
  //     );

  //     setIsSavingArrangement(false);
  //     showNotification('success', response.data.message);
  //   } catch (error: any) {
  //     console.log('There was an error in rearrangement: ', error);
  //     showNotification(
  //       'error',
  //       'There was an error in rearrangement: ' + error,
  //     );
  //     setIsSavingArrangement(false);
  //   }
  // };

  const switchDay = (newValue: number) => {
    setRouteIndex(0);
    setDayIndex(newValue);
    setRoutes([]);
  };

  return (
    <Sidebar>
      {NotificationComp}
      {/* <LoadingModal open={isSavingArrangement} /> */}
      <AddOrder
        open={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        clientList={clients?.data?.clientList || []}
        showNotification={showNotification}
        createScheduledOrder={createScheduledOrder}
      />
      <AddRoute
        open={isAddRouteOpen}
        onClose={() => setIsAddRouteOpen(false)}
        day={days[dayIndex]}
        driverList={drivers?.data || []}
        // clientList={clients?.data?.clientList || []}
        // disabledClientList={clients?.data?.existedUserRoute || []}
        showNotification={showNotification}
        handleAddRouteUI={onAddRouteUI}
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
        showNotification={showNotification}
        // handlePreOrder={handlePreOrder}
        // progress={preOrderProgress}
        scheduleOrderList={selectedOrders}
      />
      <ReArrangementModal
        open={isOpenReArrangement}
        onClose={() => setIsOpenReArrangement(false)}
        scheduledOrders={orderList || []}
        showNotification={showNotification}
      />
      {routes.length > 0 && (
        <EditRoute
          open={isEditRouteOpen}
          onClose={() => setIsEditRouteOpen(false)}
          driverList={drivers?.data || []}
          // clientList={clients?.data?.clientList || []}
          day={days[dayIndex]}
          // handleUpdateRouteUI={}
          showNotification={showNotification}
          route={routes[routeIndex]}
        />
      )}
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
            icon={<VerifiedIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Qualify for Placement"
            value={calculateToCreateOrders() as number}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <OverviewCard
            icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Total Bill"
            value={calculateTotalBill()}
          />
        </Grid>
      </Grid>
      <ShadowSection>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="basic tabs"
            value={dayIndex}
            onChange={(e, newValue: number) => switchDay(newValue)}
            variant={mdDown ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
          >
            {days &&
              days.map((day: string, index: number) => {
                return (
                  <Tab
                    key={index}
                    id={`simple-tab-${index}`}
                    label={`${day} ${recommendDate.day === day ? '•' : ''}`}
                    aria-controls={`tabpanel-${index}`}
                    value={index}
                  />
                );
              })}
          </Tabs>
        </Box>
        <Grid container mt={3} alignItems="flex-start" spacing={2}>
          <Grid item md={2} xs={12}>
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
                  disabled={routes.length === 0}
                >
                  Delete
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setIsEditRouteOpen(true)}
                  disabled={routes.length === 0}
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
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    width: '100%',
                  }}
                >
                  <Tabs
                    orientation={mdDown ? 'horizontal' : 'vertical'}
                    aria-label="basic tabs"
                    value={routeIndex}
                    onChange={(e, newValue) => setRouteIndex(newValue)}
                    variant={mdDown ? 'scrollable' : 'fullWidth'}
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
                            id={`simple-tab-${route.name}`}
                            label={`${route.name} - ${route?.employee?.name}`}
                            aria-controls={`tabpanel-${route.name}`}
                            value={index}
                          />
                        );
                      })}
                  </Tabs>
                </Box>
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
              <Fab
                size="medium"
                color="primary"
                variant="extended"
                onClick={() => setIsAddRouteOpen(true)}
              >
                <AddIcon />
              </Fab>
            </Box>
          </Grid>
          <Grid item container alignItems="center" md={10} xs={12} spacing={1}>
            <Grid item md={2} xs={12}>
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
            <Grid item md={8} xs={12}>
              <TextField
                fullWidth
                placeholder="Search by client name or client id"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
              />
            </Grid>
            <Grid item md={2} xs={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={mdDown ? 'flex-end' : ''}
                gap={1}
              >
                <Fab
                  variant="extended"
                  size="medium"
                  color="primary"
                  onClick={() => setIsAddOrderOpen(true)}
                >
                  <AddIcon />
                </Fab>
                <Fab
                  disabled={selectedOrders.length === 0}
                  onClick={() => deleteSelectedOrders()}
                  color="error"
                  size="medium"
                  variant="extended"
                >
                  <DeleteIcon />
                </Fab>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                disabled={orderList.length === 0}
                control={
                  <Checkbox
                    checked={selectedOrders.length === orderList.length}
                    onChange={handleSelectAll}
                  />
                }
                label="All"
              />
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Button
                disabled={
                  baseOrderList.length === 0 ||
                  orderList.length !== baseOrderList.length
                }
                onClick={() => setIsOpenReArrangement(true)}
              >
                Re Arrange
              </Button>
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <SplashScreen />
              ) : orderList && orderList.length > 0 ? (
                orderList.map(
                  (order: ScheduledOrder) => {
                    return (
                      // <Reorder.Item
                      //   key={order.id}
                      //   value={order}
                      //   style={{ listStyle: 'none' }}
                      //   transition={{
                      //     type: 'spring',
                      //     damping: 10,
                      //     stiffness: 300,
                      //     mass: 0.5,
                      //   }}
                      // >
                      <Fragment key={order.id}>
                        <ScheduleOrder
                          key={order.id}
                          scheduleOrder={order}
                          handleDeleteOrderUI={handleDeleteOrderUI}
                          mutateOrders={mutateOrders}
                          selectedOrders={selectedOrders}
                          handleSelectOrder={handleSelectOrder}
                          routes={routes}
                          routeId={routes[routeIndex]?.id || -1}
                          showNotification={showNotification}
                        />
                        <Divider />
                      </Fragment>
                      // </Reorder.Item>
                    );
                  },
                  // </Reorder.Group>
                )
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
    </Sidebar>
  );
}
