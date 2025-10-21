'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { limitOrderHour } from '@/app/lib/constant';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { UserType } from '@/app/utils/type';
import axios from 'axios';
import { ORDER_STATUS } from '@/app/utils/enum';
import { YYYYMMDDFormat, generateMonthRange } from '@/app/utils/time';
import Sidebar from '@/app/components/Sidebar';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { 
  Box, 
  Grid, 
  IconButton, 
  Typography, 
  Card, 
  CardContent,
  Stack,
  Paper,
  Fade,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { blue } from '@mui/material/colors';
import { useRouter } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import OrderAccordion from '@/app/components/OrderAccordion';
import { useQuery } from '@tanstack/react-query';
import ViewDelivery from '@/app/components/Modals/ViewDelivery';

export default function MainPage() {
  const [client, setClient] = useState<UserType | null>();
  const [isOpenViewDelivery, setIsOpenViewDelivery] = useState<boolean>(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Memoize isTomorrow calculation
  const isTomorrow = useMemo(() => {
    const dateObj = new Date();
    return dateObj.getHours() >= limitOrderHour;
  }, []);

  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [thisMonthOrders, setThisMonthOrders] = useState<Order[]>([]);

  const router: any = useRouter();
  const { showNotification, NotificationComp } = useNotification();

  // Memoize date range calculation
  const dateRange = useMemo(() => {
    const range = generateMonthRange();
    const today = new Date();
    const endDate = range[1];
    endDate.setDate(today.getDate() + 2);
    return range;
  }, []);

  const {
    data: clientOrders,
    isLoading: isValidating,
    refetch,
  } = useQuery({
    queryKey: ['client-orders', dateRange[0], dateRange[1]],
    queryFn: async () => {
      const response = await axios.get(
        `/api/order?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
      );
      return response.data.data;
    },
  });

  useEffect(() => {
    refetch();
  }, []);

  // Memoize processed data to avoid recalculating on every render
  const processedData = useMemo(() => {
    if (!clientOrders) return null;

    const dateObj = new Date();
    if (dateObj.getHours() >= limitOrderHour) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    const formattedDate = YYYYMMDDFormat(dateObj);
    const userOrderList = clientOrders.userOrders;

    const orderToday = userOrderList
      .filter((order: Order) => order.deliveryDate === formattedDate)
      .map((order: Order) => ({ ...clientOrders.user, ...order }));

    const orderList = filterDateRangeOrders(
      userOrderList,
      dateRange[0],
      dateRange[1],
    );

    return {
      user: clientOrders.user,
      todayOrders: orderToday,
      monthOrders: orderList,
    };
  }, [clientOrders, dateRange]);

  // Update states when processed data changes
  useEffect(() => {
    if (processedData) {
      // Batch state updates to prevent multiple re-renders
      setClient(processedData.user);
      setUserOrders(processedData.todayOrders);
      setThisMonthOrders(processedData.monthOrders);
    }
  }, [processedData]);

  useEffect(() => {
    if (
      clientOrders?.todayDeliveredOrder?.delivery &&
      !clientOrders?.todayDeliveredOrder?.delivery?.isViewed
    ) {
      setIsOpenViewDelivery(true);
    }
  }, [clientOrders?.todayDeliveredOrder?.delivery]);

  const handleDeleteOrder = useCallback(
    async (orderId: number) => {
      try {
        const response = await axios.put(`/api/order/status`, {
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
    },
    [thisMonthOrders, userOrders, showNotification],
  );

  const handleUpdateOrderUI = useCallback(
    (updatedOrder: Order) => {
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
    },
    [thisMonthOrders, userOrders],
  );

  if (isValidating && !clientOrders) {
    return (
      <Sidebar>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
        >
          <LoadingComponent />
        </Box>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <ViewDelivery
        open={isOpenViewDelivery}
        onClose={() => setIsOpenViewDelivery(false)}
        order={clientOrders?.todayDeliveredOrder}
        isDisableCloseOnClickOutside={true}
      />
      {NotificationComp}
      
      {/* Compact Full-Width Header Section */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            p: isMobile ? 2.5 : 3,
            mb: isMobile ? 1.5 : 2,
            borderRadius: isMobile ? 1.5 : 2,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <Box position="relative" zIndex={1}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Box>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    fontWeight="300"
                    sx={{ mb: 0.5, opacity: 0.9, fontSize: isMobile ? '1rem' : '1.25rem' }}
                  >
                    Welcome back,
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"}
                    fontWeight="600"
                    sx={{ mb: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }}
                  >
                    {client?.clientName}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Fade>

      {/* Compact Full-Width Stats Section */}
      <Slide direction="up" in timeout={1000}>
        <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight="600" 
            sx={{ mb: isMobile ? 1.5 : 2, color: 'text.primary' }}
          >
            Monthly Overview
          </Typography>
          
          {/* Compact Stats Row */}
          <Grid container spacing={isMobile ? 1 : 1.5}>
          
            {/* Overdue Amount Card */}
            <Grid item xs={6}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: 'white',
                  borderRadius: isMobile ? 1.5 : 2,
                  transition: 'all 0.3s ease',
                  height: isMobile ? 80 : 90,
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-2px)',
                    boxShadow: isMobile ? '0 2px 8px rgba(25, 118, 210, 0.2)' : '0 8px 16px rgba(25, 118, 210, 0.3)',
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem', lineHeight: 1 }}
                      >
                        Overdue
                      </Typography>
                      <Typography 
                        variant={isMobile ? "h6" : "h5"} 
                        fontWeight="700"
                        sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem', lineHeight: 1.2 }}
                      >
                        ${clientOrders?.dueAmount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <AttachMoneyIcon sx={{ fontSize: isMobile ? 20 : 24, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Current Month Bill Card */}
            <Grid item xs={6}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                  color: 'white',
                  borderRadius: isMobile ? 1.5 : 2,
                  transition: 'all 0.3s ease',
                  height: isMobile ? 80 : 90,
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-2px)',
                    boxShadow: isMobile ? '0 2px 8px rgba(66, 165, 245, 0.2)' : '0 8px 16px rgba(66, 165, 245, 0.3)',
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem', lineHeight: 1 }}
                      >
                        This Month
                      </Typography>
                      <Typography 
                        variant={isMobile ? "h6" : "h5"} 
                        fontWeight="700"
                        sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem', lineHeight: 1.2 }}
                      >
                        ${clientOrders?.currentMonthBill?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: isMobile ? 20 : 24, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Slide>

      {/* Compact Combined Orders Section */}
      <Slide direction="up" in timeout={1200}>
        <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
          <Grid container spacing={isMobile ? 1 : 1.5}>
            {/* Today's Delivered Order */}
            {clientOrders?.todayDeliveredOrder && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Box display="flex" alignItems="center" mb={isMobile ? 1 : 1.5}>
                    <Box
                      sx={{
                        width: 3,
                        height: isMobile ? 16 : 20,
                        backgroundColor: blue[500],
                        borderRadius: 1.5,
                        mr: 1.5,
                      }}
                    />
                    <Typography 
                      variant={isMobile ? "subtitle2" : "subtitle1"} 
                      fontWeight="600" 
                      color="text.primary"
                      sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                    >
                      Today&apos;s Delivered
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      border: `1px solid ${blue[200]}`,
                      borderRadius: isMobile ? 1.5 : 2,
                      overflow: 'hidden',
                    }}
                  >
                    <OrderAccordion
                      key={clientOrders?.todayDeliveredOrder.id}
                      handleDeleteOrder={() => {}}
                      order={clientOrders?.todayDeliveredOrder}
                      showNotification={showNotification}
                      handleUpdateOrderUI={() => {}}
                    />
                  </Paper>
                </Box>
              </Grid>
            )}

            {/* Current Orders */}
            <Grid item xs={12} md={clientOrders?.todayDeliveredOrder ? 6 : 12}>
              <Box>
                <Box display="flex" alignItems="center" mb={isMobile ? 1 : 1.5}>
                  <Box
                    sx={{
                      width: 3,
                      height: isMobile ? 16 : 20,
                      backgroundColor: blue[500],
                      borderRadius: 1.5,
                      mr: 1.5,
                    }}
                  />
                  <Typography 
                    variant={isMobile ? "subtitle2" : "subtitle1"} 
                    fontWeight="600" 
                    color="text.primary"
                    sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                  >
                    {isTomorrow ? 'Tomorrow' : 'Today'}&apos;s Orders
                  </Typography>
                </Box>
                
                {userOrders.length > 0 ? (
                  <Stack spacing={isMobile ? 1 : 1.5}>
                    {userOrders.map((order: Order, index: number) => (
                      <Fade in timeout={1600 + index * 200} key={order.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: isMobile ? 1.5 : 2,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: isMobile ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
                              borderColor: blue[300],
                            }
                          }}
                        >
                          <OrderAccordion
                            handleDeleteOrder={handleDeleteOrder}
                            order={order}
                            showNotification={showNotification}
                            handleUpdateOrderUI={handleUpdateOrderUI}
                            isEdit
                          />
                        </Paper>
                      </Fade>
                    ))}
                  </Stack>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: isMobile ? 3 : 4,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: isMobile ? 1.5 : 2,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <ShoppingCartIcon 
                      sx={{ 
                        fontSize: isMobile ? 36 : 48, 
                        color: 'grey.400', 
                        mb: 1.5 
                      }} 
                    />
                    <Typography 
                      variant={isMobile ? "body2" : "subtitle1"} 
                      fontWeight="500" 
                      color="text.secondary"
                      sx={{ mb: 1, fontSize: isMobile ? '0.875rem' : '1rem' }}
                    >
                      No orders for {isTomorrow ? 'tomorrow' : 'today'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mb: 2, fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      Create an order for {isTomorrow ? 'tomorrow' : 'today'}
                    </Typography>
                    <IconButton
                      onClick={() => router.push('/user/order')}
                      sx={{
                        backgroundColor: blue[500],
                        color: 'white',
                        p: isMobile ? 1 : 1.5,
                        minWidth: isMobile ? 40 : 48,
                        minHeight: isMobile ? 40 : 48,
                        '&:hover': {
                          backgroundColor: blue[600],
                          transform: isMobile ? 'scale(1.02)' : 'scale(1.05)',
                        },
                        '&:active': {
                          transform: isMobile ? 'scale(0.98)' : 'scale(1.02)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <AddBoxIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                    </IconButton>
                  </Paper>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Slide>
    </Sidebar>
  );
}
