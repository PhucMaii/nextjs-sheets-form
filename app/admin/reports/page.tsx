'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ShadowSection } from './styled';
import { Notification, UserType } from '@/app/utils/type';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import NotificationPopup from '../components/Notification';
import { Order } from '../orders/page';
import StatusText, { COLOR_TYPE } from '../components/StatusText';
import ErrorComponent from '../components/ErrorComponent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

export default function ReportPage() {
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });

  useEffect(() => {
    fetchAllClients();
  }, []);

  useEffect(() => {
    if (clientValue) {
      fetchClientOrders();
    } else {
      setClientOrders([]);
    }
  }, [clientValue]);

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
        `${API_URL.CLIENTS}/orders?userId=${clientValue?.id}`,
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

      setClientOrders(response.data.data);
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

  return (
    <Sidebar>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <Typography variant="h4">Reports</Typography>
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
        {isFetching ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <LoadingComponent color="blue" />
          </Box>
        ) : clientOrders.length > 0 ? (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 800 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Id</TableCell>
                    <TableCell>Order Time</TableCell>
                    <TableCell>Delivery Date</TableCell>
                    <TableCell>Total Bill</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientOrders.map((order: Order) => {
                    const statusText = {
                      text: order.status,
                      type:
                        order.status === ORDER_STATUS.COMPLETED
                          ? COLOR_TYPE.SUCCESS
                          : order.status === ORDER_STATUS.INCOMPLETED
                            ? COLOR_TYPE.WARNING
                            : COLOR_TYPE.ERROR,
                    };
                    return (
                      <TableRow>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.orderTime}</TableCell>
                        <TableCell>{order.deliveryDate}</TableCell>
                        <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <StatusText
                            text={statusText.text}
                            type={statusText.type}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Button>Edit</Button>
                            <Button color="error">Delete</Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <ErrorComponent errorText="No Order Available" />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
