'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  Typography,
  Paper,
  useMediaQuery,
  Fab,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { OrderedItems } from '@/app/utils/type';
import axios from 'axios';
import {
  API_URL,
  ORDER_STATUS,
  PAYMENT_TYPE,
  USER_ROLE,
} from '@/app/utils/enum';
import { getWCODDay, YYYYMMDDFormat } from '@/app/utils/time';
import { Item, Order } from '@/app/admin/[companyId]/orders/page';
import LoadingModal from '@/app/admin/[companyId]/components/Modals/LoadingModal';
import { Virtuoso } from 'react-virtuoso';
import OrderComponent from '../components/OrderComponent';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import { primary, success } from '@/theme/color';
import ErrorComponent from '@/app/admin/[companyId]/components/ErrorComponent';
import SearchModal from '../components/Modals/SearchModal';
import { SWRFetchData } from '@/app/utils/db';
import useNotification from '@/hooks/useNotification';
import InsertOrderToCodBoard from '@/app/admin/[companyId]/components/Modals/add/InsertOrderToCodBoard';
import SwitchRole from '../components/Modals/SwitchRole';
import { PaymentStatus } from '@prisma/client';
import ReassignmentBanner from '../components/ReassignmentBanner';
import AcceptOrderModal from '../components/Modals/AcceptOrderModal';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { alpha } from '@mui/material/styles';

interface StatCardProps {
  label: string;
  current: string | number;
  total: string | number;
  color: string;
  icon: React.ReactNode;
}

function StatCard({ label, current, total, color, icon }: StatCardProps) {
  const percentage = useMemo(() => {
    const currentNum =
      typeof current === 'string'
        ? parseFloat(current.replace('$', ''))
        : current;
    const totalNum =
      typeof total === 'string' ? parseFloat(total.replace('$', '')) : total;
    if (totalNum === 0) return 0;
    return Math.round((currentNum / totalNum) * 100);
  }, [current, total]);

  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1.5 : 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={0.5}
      >
        <Typography
          variant="caption"
          fontWeight={600}
          color={color}
          textTransform="uppercase"
          letterSpacing={0.5}
          fontSize={isMobile ? '0.65rem' : '0.75rem'}
        >
          {label}
        </Typography>
        <Box
          sx={{
            color: color,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            sx: { fontSize: isMobile ? 20 : 24 },
          })}
        </Box>
      </Box>
      <Box>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight={700}
          color={color}
          lineHeight={1.2}
          mb={0.5}
        >
          {current}
        </Typography>

        {/* <Typography
          variant="caption"
        //   fontWeight={700}
          color={color}
          lineHeight={1.2}
          mb={0.5}
        >
          / {total}
        </Typography> */}
        <Typography
          variant="subtitle1"
          color="text.secondary"
          fontWeight={600}
        >
          of {total}
        </Typography>
      </Box>
      <Box
        sx={{
          mt: 1,
          height: 10,
          borderRadius: 2,
          backgroundColor: alpha(color, 0.1),
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </Paper>
  );
}

const TABS = [
  { label: 'Today', value: 'Today' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'C.O.D', value: 'C.O.D' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function OrdersPage() {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isOpenInsertToCOD, setIsOpenInsertToCOD] = useState<boolean>(false);
  const [isOpenSwitchRole, setIsOpenSwitchRole] = useState<boolean>(false);
  const [openAcceptOrderModal, setOpenAcceptOrderModal] = useState<{
    open: boolean;
    order: Order | null;
  }>({
    open: false,
    order: null,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);

  const date = new Date();
  const today = YYYYMMDDFormat(date);
  const wcodDay = getWCODDay(today);

  const { showNotification, NotificationComp } = useNotification();
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const [ordersResponse, mutateOrders, isValidating] = SWRFetchData(
    `${API_URL.DRIVER_ORDERS}?deliveryDate=${today}`,
  );
  const [board, mutateBoard] = SWRFetchData(
    `${API_URL.DRIVER}/cod?date=${today}`,
  );

  const tabValue = useMemo(
    () => TABS[currentTab]?.value || 'Today',
    [currentTab],
  );

  useEffect(() => {
    const updateHeight = () => {
      const windowDimensions = getWindowDimensions();
      // Mobile-first: Calculate height based on available space
      // Account for sticky header, tabs, stats, and bottom navigation
      const mobileOffset = isMobile ? 420 : 320;
      setVirtuosoHeight(Math.max(windowDimensions.height - mobileOffset, 300));
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isMobile]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, ordersResponse, board, tabValue]);

  useEffect(() => {
    if (ordersResponse?.data?.pendingReassignmentOrders?.length > 0) {
      setOpenAcceptOrderModal({
        open: true,
        order: ordersResponse?.data.pendingReassignmentOrders[0],
      });
    }
  }, [ordersResponse]);

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
      if (order.paymentStatus === PaymentStatus.Paid) {
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

  const filterOrderByStatus = (
    orderList: Order[],
    status: ORDER_STATUS | PaymentStatus,
    type: 'fulfillment' | 'payment',
  ) => {
    const filteredOrders = orderList.filter((order: Order) => {
      if (type === 'fulfillment') {
        return order.status === status;
      } else {
        return order.paymentStatus === status;
      }
    });

    return filteredOrders;
  };

  const initializeOrders = () => {
    const tab = tabValue;
    if (tab === 'C.O.D') {
      setOrders(board?.data?.orders || []);
      setDisplayOrders(board?.data?.orders || []);
    } else if (tab === 'Delivered') {
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
        tab === 'Today' ? ORDER_STATUS.INCOMPLETED : PaymentStatus.Paid,
        tab === 'Today' ? 'fulfillment' : 'payment',
      );
      setDisplayOrders(newOrders);
    }
    setIsFetching(false);
  };

  const handleUpdateStatus = async (
    orderId: number,
    updatedStatus: ORDER_STATUS,
    fileKey?: string,
  ) => {
    console.log(fileKey, 'fileKey in handle update status');
    // return;
    try {
      const response = await axios.put(`${API_URL.DRIVER_ORDERS}/status`, {
        orderId,
        updatedStatus,
        fileKey,
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
      if (order.id === targetOrder.id) {
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Sidebar>
      <SwitchRole
        open={isOpenSwitchRole}
        onClose={() => setIsOpenSwitchRole(false)}
      />
      <AcceptOrderModal
        open={openAcceptOrderModal.open}
        onClose={() =>
          setOpenAcceptOrderModal({
            open: false,
            order: null,
          })
        }
        order={openAcceptOrderModal.order as Order}
        showNotification={showNotification}
      />
      {tabValue === 'C.O.D' && board?.data?.id && (
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
        orders={ordersResponse?.data.deliveryOrders || []}
        handleUpdateStatus={handleUpdateStatus}
        handleUpdateItem={handleUpdateItem}
        showNotification={showNotification}
      />

      {/* Sticky Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          top: isMobile ? 0 : 0,
          zIndex: 1100,
          p: 2,
          borderRadius: 2,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: '56px !important', sm: '64px !important' },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              fontWeight={700}
              color="primary.main"
              noWrap
            >
              Orders
            </Typography>
            <IconButton
              onClick={() => setIsSearchModalOpen(true)}
              color="primary"
              size="large"
              sx={{ ml: 1 }}
            >
              <SearchIcon fontSize={isMobile ? 'medium' : 'large'} />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="orders tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: 600,
                textTransform: 'none',
              },
            }}
          >
            {TABS.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </AppBar>

      {/* Stats Cards */}
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2 }, pt: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <StatCard
              label="Delivered"
              current={deliveredOrders.length || 0}
              total={orders.length || 0}
              color={primary.main}
              icon={<LocalShippingIcon />}
            />
          </Grid>
          <Grid item xs={6}>
            <StatCard
              label="Collected"
              current={`$${parseFloat(String(collectedAmount)).toFixed(2)}`}
              total={`$${parseFloat(String(codAmount)).toFixed(2)}`}
              color={success.main}
              icon={<AttachMoneyIcon />}
            />
          </Grid>

          {ordersResponse?.data?.acceptedReassignmentOrders?.length > 0 && (
            <Grid item xs={12}>
              <ReassignmentBanner
                ordersLength={
                  ordersResponse?.data.acceptedReassignmentOrders.length
                }
              />
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        {displayOrders?.length > 0 ? (
          <Virtuoso
            totalCount={displayOrders?.length || 0}
            style={{ height: virtuosoHeight }}
            data={displayOrders}
            itemContent={(index, order) => {
              return (
                <Box sx={{ px: { xs: 1, sm: 2 }, pb: 1 }}>
                  <OrderComponent
                    key={order.id}
                    order={order}
                    handleUpdateStatus={handleUpdateStatus}
                    handleUpdateItem={handleUpdateItem}
                    showNotification={showNotification}
                  />
                </Box>
              );
            }}
          />
        ) : (
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            <ErrorComponent errorText="No Order Found" />
          </Box>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {displayOrders?.length > 0 ? (
          <Virtuoso
            totalCount={displayOrders?.length || 0}
            style={{ height: virtuosoHeight }}
            data={displayOrders}
            itemContent={(index, order) => {
              return (
                <Box sx={{ px: { xs: 1, sm: 2 }, pb: 1 }}>
                  <OrderComponent
                    key={order.id}
                    order={order}
                    handleUpdateStatus={handleUpdateStatus}
                    handleUpdateItem={handleUpdateItem}
                    showNotification={showNotification}
                  />
                </Box>
              );
            }}
          />
        ) : (
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            <ErrorComponent errorText="No Delivered Orders Found" />
          </Box>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {tabValue === 'C.O.D' && !board?.data ? (
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            <ErrorComponent errorText="Please wait for admin to create your board." />
          </Box>
        ) : displayOrders?.length > 0 ? (
          <Virtuoso
            totalCount={displayOrders?.length || 0}
            style={{ height: virtuosoHeight }}
            data={displayOrders}
            itemContent={(index, order) => {
              return (
                <Box sx={{ px: { xs: 1, sm: 2 }, pb: 1 }}>
                  <OrderComponent
                    key={order.id}
                    order={order}
                    handleUpdateStatus={handleUpdateStatus}
                    handleUpdateItem={handleUpdateItem}
                    showNotification={showNotification}
                  />
                </Box>
              );
            }}
          />
        ) : (
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            <ErrorComponent errorText="No C.O.D Orders Found" />
          </Box>
        )}
      </TabPanel>

      {/* Floating Action Button for COD Insert */}
      {tabValue === 'C.O.D' && board?.data?.id && (
        <Fab
          color="primary"
          aria-label="add order to COD"
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 24,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => setIsOpenInsertToCOD(true)}
        >
          <AddIcon />
        </Fab>
      )}
    </Sidebar>
  );
}
