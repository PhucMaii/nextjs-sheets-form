'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ShadowSection } from '@/app/admin/reports/styled';
import { OrderedItems } from '@/app/utils/type';
import axios from 'axios';
import {
  API_URL,
  ORDER_STATUS,
  PAYMENT_TYPE,
  USER_ROLE,
} from '@/app/utils/enum';
import { getWCODDay, YYYYMMDDFormat } from '@/app/utils/time';
import { Item, Order } from '@/app/admin/orders/page';
import LoadingModal from '@/app/admin/components/Modals/LoadingModal';
import { Virtuoso } from 'react-virtuoso';
import OrderComponent from '../components/OrderComponent';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import { primary, success } from '@/theme/color';
import ErrorComponent from '@/app/admin/components/ErrorComponent';
import SearchModal from '../components/Modals/SearchModal';
import { SWRFetchData } from '@/app/utils/db';
import useNotification from '@/hooks/useNotification';
import InsertOrderToCodBoard from '@/app/admin/components/Modals/add/InsertOrderToCodBoard';
import SwitchRole from '../components/Modals/SwitchRole';
function CircularProgressWithLabel(props: any) {
  const value = Math.round((props.currentValue / props.basedValue) * 100);
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
        variant="determinate"
        size={120}
        value={value > 100 ? 100 : value}
        sx={{ color: props.color }}
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
          color={props.valueColor}
        >
          {props.currentValue} / {props.basedValue}
        </Typography>
      </Box>
    </Box>
  );
}

const tabs = ['Today', 'Delivered', 'C.O.D'];

const totalYPosition = 250;
export default function OrdersPage() {
  const [currentTab, setCurrentTab] = useState<string>('Today');
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isOpenInsertToCOD, setIsOpenInsertToCOD] = useState<boolean>(false);
  const [isOpenSwitchRole, setIsOpenSwitchRole] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);

  const date = new Date();
  const today = YYYYMMDDFormat(date);
  const wcodDay = getWCODDay(today);

  const { showNotification, NotificationComp } = useNotification();
  // const { date: datePicker, SelectDate } = useSelectDate(today);

  const [ordersResponse, mutateOrders, isValidating] = SWRFetchData(
    `${API_URL.DRIVER_ORDERS}?deliveryDate=${today}`,
  );
  const [board, mutateBoard] = SWRFetchData(
    `${API_URL.DRIVER}/cod?date=${today}`,
  );

  useEffect(() => {
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - totalYPosition);
  }, []);

  // useEffect(() => {
  //   if (ordersResponse) {
  //     const unfulfilledOrders = filterOrderByStatus(
  //       ordersResponse?.data.deliveryOrders,
  //       currentTab === 'Today'
  //         ? ORDER_STATUS.INCOMPLETED
  //         : ORDER_STATUS.COMPLETED,
  //     );

  //     // if (unfulfilledOrders.length === 0) {
  //     //   setIsOpenSwitchRole(true);
  //     // }
  //   }
  // }, [ordersResponse]);

  // Handle loading
  useEffect(() => {
    if (isValidating && !ordersResponse) {
      setIsFetching(true);
    } else if (!isValidating && ordersResponse) {
      setIsFetching(false);
    }
  }, [ordersResponse, isValidating]);

  useEffect(() => {
    if (ordersResponse) {
      initializeOrders();
    }
  }, [currentTab, ordersResponse, board]);

  const deliveredOrders = useMemo(() => {
    if (orders?.length === 0) {
      return [];
    }

    const newDeliveredOrders = orders.filter((order: Order) => {
      return (
        order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.COMPLETED
      );
    });

    return newDeliveredOrders;
  }, [orders]);

  const collectedAmount = useMemo(() => {
    if (orders?.length === 0) {
      return 0;
    }

    const codCollected = orders.reduce((acc: number, order: Order) => {
      if (order.status === ORDER_STATUS.COMPLETED) {
        return acc + order.totalPrice;
      }

      return acc;
    }, 0);

    return codCollected.toFixed(2);
  }, [orders]);

  const codAmount = useMemo(() => {
    if (orders?.length === 0) {
      return 0;
    }

    const nonVoidOrders = orders.filter((order: Order) => {
      return order.status !== ORDER_STATUS.VOID;
    });

    const amount = nonVoidOrders.reduce((acc: number, order: Order) => {
      if (
        order.user.preference.paymentType === PAYMENT_TYPE.COD ||
        order.user.preference.paymentType === wcodDay
      ) {
        return acc + order.totalPrice;
      }

      return acc;
    }, 0);

    return amount.toFixed(2);
  }, [orders]);

  const filterOrderByStatus = (orderList: Order[], status: ORDER_STATUS) => {
    const filteredOrders = orderList.filter((order: Order) => {
      return order.status === status;
    });

    return filteredOrders;
  };

  const initializeOrders = () => {
    if (currentTab === 'C.O.D') {
      setOrders(board?.data?.orders || []);
      setDisplayOrders(board?.data?.orders || []);
    } else if (currentTab === 'Delivered') {
      setOrders(ordersResponse?.data.deliveryOrders);
      const newDeliveredOrders = ordersResponse?.data.deliveryOrders.filter(
        (order: Order) => {
          return (
            order.status === ORDER_STATUS.DELIVERED ||
            order.status === ORDER_STATUS.COMPLETED
          );
        },
      );
      setDisplayOrders(newDeliveredOrders);
    } else {
      setOrders(ordersResponse?.data.deliveryOrders);
      const newOrders = filterOrderByStatus(
        ordersResponse?.data.deliveryOrders,
        currentTab === 'Today'
          ? ORDER_STATUS.INCOMPLETED
          : ORDER_STATUS.COMPLETED,
      );
      setDisplayOrders(newOrders);
    }
    setIsFetching(false);
  };

  const handleUpdateStatus = async (
    orderId: number,
    updatedStatus: ORDER_STATUS,
  ) => {
    try {
      const response = await axios.put(`${API_URL.DRIVER_ORDERS}/status`, {
        orderId,
        updatedStatus,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic UI Update
      handleUpdateStatusUI(response.data.data);

      // Update Real Data
      mutateOrders();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleUpdateStatusUI = (updatedOrder: Order) => {
    const newOrders: any = orders.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });
    setOrders(newOrders);
  };

  const handleUpdateItem = async (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => {
    try {
      // const orderTotalPrice = calculateNewTotalPrice();
      const response = await axios.put(`${API_URL.DRIVER}/orderedItems`, {
        ...updatedItem,
        orderId: order.id,
        orderTotalPrice,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic UI Update
      handleUpdateUIItem(order, response.data.data);

      // Update Real Data
      mutateOrders();

      showNotification('success', 'Update Item Successfully');
    } catch (error: any) {
      console.log('Fail to update order items: ', error);
      showNotification('error', 'Fail to update order items: ' + error);
    }
  };

  const handleUpdateUIItem = (targetOrder: Order, targetItem: Item) => {
    const newOrderData: Order[] = orders.map((order: Order) => {
      // If order is at targetOrder, then update
      if (order.id === targetOrder.id) {
        // update total price of the order
        let orderTotalPrice = 0;

        const newItems = order.items.map((item: Item) => {
          if (item.id === targetItem.id) {
            const totalPrice = targetItem.quantity * targetItem.price;
            orderTotalPrice += totalPrice;
            return { ...targetItem, totalPrice };
          }
          orderTotalPrice += item.totalPrice;
          return item;
        });
        return { ...order, items: newItems, totalPrice: orderTotalPrice };
      }
      return order;
    });

    setOrders(newOrderData);
  };

  return (
    <Sidebar>
      <SwitchRole
        open={isOpenSwitchRole}
        onClose={() => setIsOpenSwitchRole(false)}
      />
      {currentTab === 'C.O.D' && board?.data?.id && (
        <InsertOrderToCodBoard
          open={isOpenInsertToCOD}
          onClose={() => setIsOpenInsertToCOD(false)}
          showNotification={showNotification}
          currentDate={today}
          boardId={board?.data?.id || -1}
          mutateBoards={mutateBoard}
          role={USER_ROLE.DRIVER}
        />
      )}
      {NotificationComp}
      <LoadingModal open={isFetching} />
      <SearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        orders={orders}
        handleUpdateStatus={handleUpdateStatus}
        handleUpdateItem={handleUpdateItem}
        showNotification={showNotification}
      />
      {isFetching ? (
        <Typography>Loading... {ordersResponse?.data?.length || 0}</Typography>
      ) : null}
      <Grid container alignItems="center">
        <Grid item xs={4}></Grid>
        <Grid item xs={4} textAlign="center">
          <Typography textAlign="center" variant="h4">
            Orders
          </Typography>
        </Grid>
        <Grid item xs={4} textAlign="right">
          <IconButton
            onClick={() => setIsSearchModalOpen(true)}
            color="primary"
            size="large"
          >
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
      <Box display="flex" justifyContent="flex-end" my={2}>
        {currentTab === 'C.O.D' && (
          <Button variant="outlined" onClick={() => setIsOpenInsertToCOD(true)}>
            + Insert Orders
          </Button>
        )}
      </Box>
      <Grid container my={2} spacing={2}>
        <Grid item xs={6}>
          <ShadowSection
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="center"
            alignItems="center"
            sx={{ backgroundColor: `${primary['lightest']} !important` }}
          >
            <Typography color="primary.main" variant="h6">
              Delivered
            </Typography>
            <CircularProgressWithLabel
              currentValue={deliveredOrders.length || 0}
              basedValue={orders.length || 0}
              color={primary['main']}
              valueColor={primary['main']}
            />
          </ShadowSection>
        </Grid>
        <Grid item xs={6}>
          <ShadowSection
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="center"
            alignItems="center"
            sx={{ backgroundColor: `${success['lightest']} !important` }}
          >
            <Typography color="success.main" variant="h6">
              Collected
            </Typography>
            <CircularProgressWithLabel
              currentValue={collectedAmount}
              basedValue={codAmount}
              color={success['main']}
              valueColor={success['main']}
            />
          </ShadowSection>
        </Grid>
      </Grid>
      {displayOrders?.length > 0 ? (
        <Virtuoso
          totalCount={displayOrders?.length || 0}
          style={{ height: virtuosoHeight, marginTop: 2 }}
          data={displayOrders}
          itemContent={(index, order) => {
            return (
              <OrderComponent
                key={index}
                order={order}
                handleUpdateStatus={handleUpdateStatus}
                handleUpdateItem={handleUpdateItem}
                showNotification={showNotification}
              />
            );
          }}
        />
      ) : currentTab === 'C.O.D' && !board?.data ? (
        <>
          <ErrorComponent errorText="Please wait for admin to create your board." />
        </>
      ) : (
        <ErrorComponent errorText="No Order Found" />
      )}
    </Sidebar>
  );
}
