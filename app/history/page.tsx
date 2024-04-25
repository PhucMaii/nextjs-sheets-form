'use client';
import React, { useEffect, useRef, useState } from 'react';
import AuthenGuard, { SplashScreen } from '../HOC/AuthenGuard';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PendingIcon from '@mui/icons-material/Pending';
import SelectDateRange from '../admin/components/SelectDateRange';
import { generateMonthRange } from '../utils/time';
import { Order } from '../admin/orders/page';
import axios from 'axios';
import { API_URL, ORDER_STATUS } from '../utils/enum';
import { Notification } from '../utils/type';
import OrderAccordion from '../components/OrderAccordion';
import { Virtuoso } from 'react-virtuoso';
import useDebounce from '@/hooks/useDebounce';
import { DropdownItemContainer } from '../admin/orders/styled';
import { errorColor, successColor, warningColor } from '../theme/color';
import { blue, blueGrey } from '@mui/material/colors';
import NotificationPopup from '../admin/components/Notification';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';

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
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);
  const debouncedKeywords = useDebounce(searchKeywords, 800);
  const totalPositionRef: any = useRef(null);
  
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  
  useEffect(() => {
      const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - totalYPosition)
  }, [])

  useEffect(() => {
    if (dateRange) {
      handleFetchClientOrders();
    }
  }, [dateRange]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderData = baseClientOrders.filter((order: Order) => {
        if (
          order.id.toString().includes(debouncedKeywords) ||
          order.status.toLowerCase() === debouncedKeywords.toLowerCase()
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

  const filterOrder = (status: ORDER_STATUS) => {
    const newClientOrders = baseClientOrders.filter((order: Order) => {
      return order.status === status;
    });

    setFilterOptions(status);
    setClientOrders(newClientOrders);
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const handleFetchClientOrders = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(
        `${API_URL.CLIENT_ORDER}?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
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

      setClientOrders(response.data.data.userOrders);
      setBaseClientOrders(response.data.data.userOrders);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client orders: ', error);
      setIsFetching(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch client orders: ' + error,
      });
    }
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
      <Button
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
        endIcon={<ArrowDownwardIcon />}
        variant="outlined"
        fullWidth
      >
        Filter
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
            filterOrder(ORDER_STATUS.COMPLETED);
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.COMPLETED}
          >
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Completed orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.INCOMPLETED);
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.INCOMPLETED}
          >
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Incompleted orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.VOID);
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

  if (isFetching) {
    return (
      <Sidebar>
        <SplashScreen />
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
        <Grid container columnSpacing={2} alignItems="center" spacing={2} sx={{position: 'sticky'}}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4">History</Typography>
          </Grid>
          <Grid item xs={12} md={6} textAlign={!mdDown ? 'right' : 'left'}>
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Grid>
          <Grid item xs={12} md={10}>
            <TextField
              fullWidth
              variant="filled"
              placeholder="Search by invoice id or status"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2} textAlign="right">
            {filterDropdown}
          </Grid>
          <Grid item xs={12} ref={totalPositionRef}>
            <Box
                sx={{
                  backgroundColor: blueGrey[800],
                  color: 'white',
                  width: 'fit-content',
                  padding: 1,
                  borderRadius: 2,
                }}
            >
                <Typography variant="h6">
                  Total: {clientOrders.length} orders
                </Typography>
              </Box>
          </Grid>
          <Grid item xs={12}>
            {clientOrders.length > 0 && (
              <Virtuoso
                totalCount={clientOrders.length}
                style={{ height: virtuosoHeight }}
                data={clientOrders}
                itemContent={(index: number, order: Order) => (
                  <OrderAccordion key={index} order={order} />
                )}
              />
            )}
          </Grid>
        </Grid>
      </AuthenGuard>
    </Sidebar>
  );
}
