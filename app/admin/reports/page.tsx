'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Autocomplete,
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { ShadowSection } from './styled';
import { Notification, UserType } from '@/app/utils/type';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import NotificationPopup from '../components/Notification';
import { Order } from '../orders/page';
import ErrorComponent from '../components/ErrorComponent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import SelectDateRange from '../components/SelectDateRange';
import SearchInput from '../components/SearchInput';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { blue } from '@mui/material/colors';
import useDebounce from '@/hooks/useDebounce';
import ClientOrdersTable from '../components/ClientOrdersTable';
import AuthenGuard from '@/app/HOC/AuthenGuard';

const generateMonthRange = () => {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const firstDayOfThisMonth = new Date(year, month, 1);
  return [firstDayOfThisMonth, today];
};

export default function ReportPage() {
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [totalBill, setTotalBill] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    fetchAllClients();
  }, []);

  useEffect(() => {
    if (clientOrders.length > 0) {
      calculateTotalBill();
    } else {
      setTotalBill(0);
    }
  }, [clientOrders]);

  useEffect(() => {
    if (clientValue && dateRange.length > 0) {
      fetchClientOrders();
    } else {
      setClientOrders([]);
      setBaseClientOrders([]);
    }
  }, [clientValue, dateRange]);

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

  const calculateTotalBill = () => {
    const bill = clientOrders.reduce((acc: number, cV: Order) => {
      return acc + cV.totalPrice;
    }, 0);

    setTotalBill(bill);
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
    }
  };

  const fetchClientOrders = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(
        `${API_URL.CLIENTS}/orders?userId=${clientValue?.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
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

      const completedOrders = response.data.data.filter((order: Order) => {
        return order.status === ORDER_STATUS.COMPLETED;
      });

      setCompletedOrders(completedOrders);
      setClientOrders(response.data.data);
      setBaseClientOrders(response.data.data);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client orders: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch client orders: ' + error,
      });
      setIsFetching(false);
    }
  };

  const handleUpdateOrderUI = (updatedOrder: Order) => {
    const newBaseOrderList = baseClientOrders.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    const newOrderList = clientOrders.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    setClientOrders(newOrderList);
    setBaseClientOrders(newBaseOrderList);
  };

  return (
    <Sidebar>
      <AuthenGuard>
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification({ ...notification, on: false })}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Reports</Typography>
          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </Box>
        <ShadowSection display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6">Clients</Typography>
          <Autocomplete
            options={clientList as UserType[]}
            getOptionLabel={(option) =>
              `${option.clientName} - ${option.clientId}`
            }
            renderInput={(params) => <TextField {...params} label="Client" />}
            value={clientValue}
            onChange={(e, newValue) => setClientValue(newValue)}
            sx={{ width: 'auto' }}
          />
        </ShadowSection>
        <ShadowSection display="flex" alignItems="center">
          <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={0}>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <OverviewCard
                  icon={<ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />}
                  text="Total Orders"
                  value={clientOrders.length}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <OverviewCard
                  icon={
                    <AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />
                  }
                  text="Total Bill"
                  value={`$${totalBill.toFixed(2)}`}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <OverviewCard
                  icon={
                    <CheckCircleOutlineIcon
                      sx={{ color: blue[700], fontSize: 50 }}
                    />
                  }
                  text="Completed orders"
                  value={completedOrders.length}
                />
              </Grid>
            </Grid>
            <SearchInput
              name="Search"
              variant="filled"
              label="Search orders"
              placeholder="Search by invoice id or status"
              value={searchKeywords}
              onChange={setSearchKeywords}
            />
            {isFetching ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ width: '100%', mt: 2 }}
              >
                <LoadingComponent color="blue" />
              </Box>
            ) : clientOrders.length > 0 ? (
              <ClientOrdersTable
                handleUpdateOrderUI={handleUpdateOrderUI}
                clientOrders={clientOrders}
                setNotification={setNotification}
              />
            ) : (
              <ErrorComponent errorText="No Order Available" />
            )}
          </Paper>
        </ShadowSection>
      </AuthenGuard>
    </Sidebar>
  );
}