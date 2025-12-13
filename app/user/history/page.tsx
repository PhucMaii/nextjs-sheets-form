'use client';
import React, { useEffect, useState } from 'react';
import { SplashScreen } from '../../../HOC/AuthenGuard';
import Sidebar from '../../components/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Paper,
  Fade,
  Slide,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import { generateMonthRange } from '@/app/utils/time';
import { Order } from '@/app/admin/[companyId]/orders/page';
import TuneIcon from '@mui/icons-material/Tune';
import { ORDER_STATUS } from '@/app/utils/enum';
import useDebounce from '@/hooks/useDebounce';
import { DropdownItemContainer } from '@/app/admin/[companyId]/orders/styled';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '../../../theme/color';
import { blue } from '@mui/material/colors';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { SWRFetchData } from '@/app/utils/db';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SelectDateRange from '@/app/admin/[companyId]/components/Select/SelectDateRange';
// import OrderAccordion from '@/app/admin/[companyId]/components/OrderAccordion';
import { PaymentStatus } from '@prisma/client';
import OrderAccordion from '@/app/components/OrderAccordion';
import UserHeader from '@/app/components/UserHeader';

const totalYPosition = 250;
export default function HistoryPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [filterOptions, setFilterOptions] = useState<ORDER_STATUS | string>(
    'All',
  );
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);
  const [tabIdx, setTabIdx] = useState<number>(0);
  const debouncedKeywords = useDebounce(searchKeywords, 800);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // const monthRange = useMemo(() => {
  //   return generateMonthRange();
  // }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderData, _mutateOrders, isValidating]: any = SWRFetchData(
    `/api/order?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  // const currentMonthBill = useMemo(() => {
  //   return baseClientOrders.reduce((total: number, order: Order) => {
  //     return total + order.totalPrice;
  //   }, 0);
  // }, [baseClientOrders]);

  useEffect(() => {
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - totalYPosition);
  }, []);

  useEffect(() => {
    if (orderData) {
      initializeOrders();
    }
  }, [orderData, tabIdx]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderData = baseClientOrders.filter((order: Order) => {
        if (
          order.id.toString().includes(debouncedKeywords) ||
          order.status.toLowerCase() === debouncedKeywords.toLowerCase() ||
          order.deliveryDate.includes(debouncedKeywords)
        ) {
          return true;
        }
        return false;
      });
      setClientOrders(newOrderData);
    } else {
      setClientOrders(baseClientOrders);
    }
  }, [debouncedKeywords, baseClientOrders]);

  const filterOrder = (
    status: ORDER_STATUS | PaymentStatus,
    type: 'fulfillment' | 'payment',
  ) => {
    const newClientOrders = baseClientOrders.filter((order: Order) => {
      if (type === 'fulfillment') {
        return order.status === status;
      } else {
        return order.paymentStatus === status;
      }
    });

    setFilterOptions(status);
    setClientOrders(newClientOrders);
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const initializeOrders = () => {
    const orders =
      tabIdx === 0 ? orderData.data.userOrders : orderData.data.dueOrders;
    const filteredOrders = filterDateRangeOrders(
      orders,
      dateRange[0],
      dateRange[1],
    );

    setClientOrders(tabIdx === 0 ? filteredOrders : orders);
    setBaseClientOrders(tabIdx === 0 ? filteredOrders : orders);
  };

  const resetOrders = () => {
    setClientOrders(baseClientOrders);
    setFilterOptions('All');
  };

  const filterDropdown = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <IconButton onClick={(e) => setActionButtonAnchor(e.currentTarget)}>
        <TuneIcon />
      </IconButton>
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
            resetOrders();
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === 'All'}
          >
            <ReceiptLongIcon sx={{ color: blue[700] }} />
            <Typography>All orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(PaymentStatus.Paid, 'payment');
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === PaymentStatus.Paid}
          >
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Paid orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.DELIVERED, 'fulfillment');
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.DELIVERED}
          >
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Fulfilled orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.INCOMPLETED, 'fulfillment');
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.INCOMPLETED}
          >
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Unfulfilled orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.VOID, 'fulfillment');
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.VOID}
          >
            <ErrorIcon sx={{ color: errorColor }} />
            <Typography>Void orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Sidebar>
        <UserHeader 
          title="Order History"
          subtitle={tabIdx === 0 ? 'Current Month' : 'Overdue Orders'}
          chipLabel={`${baseClientOrders.length} orders`}
        />
      {/* </Fade> */}

      {/* Compact Stats Section */}
      <Slide direction="up" in timeout={1000}>
        <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            fontWeight="600"
            sx={{ mb: isMobile ? 1.5 : 2, color: 'text.primary' }}
          >
            Financial Overview
          </Typography>

          <Grid container spacing={isMobile ? 1 : 1.5}>
            {/* Overdue Amount Card */}
            <Grid item xs={6}>
              <Card
                elevation={0}
                sx={{
                  background:
                    'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: 'white',
                  borderRadius: isMobile ? 1.5 : 2,
                  transition: 'all 0.3s ease',
                  height: isMobile ? 80 : 90,
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-2px)',
                    boxShadow: isMobile
                      ? '0 2px 8px rgba(25, 118, 210, 0.2)'
                      : '0 8px 16px rgba(25, 118, 210, 0.3)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: isMobile ? 1.5 : 2,
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
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? '0.65rem' : '0.7rem',
                          lineHeight: 1,
                        }}
                      >
                        Overdue
                      </Typography>
                      <Typography
                        variant={isMobile ? 'h6' : 'h5'}
                        fontWeight="700"
                        sx={{
                          fontSize: isMobile ? '1.25rem' : '1.5rem',
                          lineHeight: 1.2,
                        }}
                      >
                        ${orderData?.data?.dueAmount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <AttachMoneyIcon
                      sx={{ fontSize: isMobile ? 20 : 24, opacity: 0.8 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Current Month Bill Card */}
            <Grid item xs={6}>
              <Card
                elevation={0}
                sx={{
                  background:
                    'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                  color: 'white',
                  borderRadius: isMobile ? 1.5 : 2,
                  transition: 'all 0.3s ease',
                  height: isMobile ? 80 : 90,
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-2px)',
                    boxShadow: isMobile
                      ? '0 2px 8px rgba(66, 165, 245, 0.2)'
                      : '0 8px 16px rgba(66, 165, 245, 0.3)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: isMobile ? 1.5 : 2,
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
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? '0.65rem' : '0.7rem',
                          lineHeight: 1,
                        }}
                      >
                        This Month
                      </Typography>
                      <Typography
                        variant={isMobile ? 'h6' : 'h5'}
                        fontWeight="700"
                        sx={{
                          fontSize: isMobile ? '1.25rem' : '1.5rem',
                          lineHeight: 1.2,
                        }}
                      >
                        $
                        {orderData?.data?.currentMonthBill?.toFixed(2) ||
                          '0.00'}
                      </Typography>
                    </Box>
                    <ReceiptLongIcon
                      sx={{ fontSize: isMobile ? 20 : 24, opacity: 0.8 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Slide>

      {/* Controls Section */}
      <Slide direction="up" in timeout={1200}>
        <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
          <Grid container spacing={isMobile ? 1 : 1.5} alignItems="center">
            <Grid item xs={12}>
              <SelectDateRange
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </Grid>
            <Grid item xs={12}>
              <Tabs
                value={tabIdx}
                variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  minHeight: isMobile ? 40 : 48,
                  '& .MuiTab-root': {
                    minHeight: isMobile ? 40 : 48,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  },
                }}
                onChange={(e: any, value) => setTabIdx(value)}
              >
                <Tab value={0} label="Current Month" />
                <Tab value={1} label="Over Due" />
              </Tabs>
            </Grid>
          </Grid>
        </Box>
      </Slide>

      {/* Search and Filter Section */}
      <Slide direction="up" in timeout={1400}>
        <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
          <Grid container spacing={isMobile ? 1 : 1.5} alignItems="center">
            <Grid item xs={11}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search by invoice id, date or status"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: isMobile ? 1.5 : 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={1} textAlign="right">
              {filterDropdown}
            </Grid>
          </Grid>
        </Box>
      </Slide>

      {/* Orders List Section */}
      <Slide direction="up" in timeout={1600}>
        <Box>
          {isValidating && !clientOrders ? (
            <SplashScreen />
          ) : clientOrders.length > 0 ? (
            <Stack spacing={isMobile ? 1 : 1.5}>
              {clientOrders.map((order: Order, index: number) => (
                <Fade in timeout={1800 + index * 200} key={order.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: isMobile ? 1.5 : 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: isMobile
                          ? '0 2px 8px rgba(0, 0, 0, 0.06)'
                          : '0 4px 12px rgba(0, 0, 0, 0.08)',
                        borderColor: blue[300],
                      },
                    }}
                  >
                    <OrderAccordion order={order} />
                  </Paper>
                </Fade>
              ))}
            </Stack>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: isMobile ? 4 : 6,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: isMobile ? 1.5 : 2,
                backgroundColor: 'grey.50',
              }}
            >
              <ReceiptLongIcon
                sx={{
                  fontSize: isMobile ? 48 : 64,
                  color: 'grey.400',
                  mb: 2,
                }}
              />
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight="500"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                No Orders Found
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
              >
                Try adjusting your search criteria or date range
              </Typography>
            </Paper>
          )}
        </Box>
      </Slide>
    </Sidebar>
  );
}
