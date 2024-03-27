'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Typography } from '@mui/material';
import OrderAccordion from '../components/OrderAccordion/OrderAccordion';
import { API_URL, ORDER_STATUS } from '../../utils/enum';
import axios from 'axios';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { useReactToPrint } from 'react-to-print';
import { AllPrint } from '../components/AllPrint';
import { Notification } from '@/app/utils/type';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NotificationPopup from '../components/Notification';
import { grey } from '@mui/material/colors';

interface Item {
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  category: string;
  orderTime: string;
  deliveryDate: string;
  clientId: string;
  deliveryAddress: string;
  clientName: string;
  contactNumber: string;
  totalPrice: number;
  userId: number;
  items: Item[];
  note: string;
  status: ORDER_STATUS;
}

export default function MainPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [orderData, setOrderData] = useState<Order[]>([]);
  const componentRef: any = useRef();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_URL.ORDER);

      if (response.data.error) {
        setOrderData([]);
        setIsLoading(false);
        return;
      }
      setOrderData(response.data.data);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to fetch orders: ', error);
      setOrderData([]);
      setIsLoading(false);
      return;
    }
  };

  const handleMarkAllCompleted = async () => {
    try {
      const response = await axios.put(API_URL.ORDER_STATUS, {
        status: ORDER_STATUS.COMPLETED,
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

  const handlePrinting = useReactToPrint({
    content: () => componentRef.current,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
        <LoadingComponent color="blue" />
      </div>
    );
  }

  return (
    <Sidebar>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <div style={{ display: 'none' }}>
        <AllPrint orders={orderData} ref={componentRef} />
      </div>
      <Box display="flex" width="100%" flexDirection="column" m={2} gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="bold" variant="h4">
            Today&apos;s Order
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <Button
              disabled={orderData.length === 0}
              onClick={handlePrinting}
              variant="outlined"
            >
              Print All
            </Button>
            <Button
              color="success"
              disabled={orderData.length === 0}
              onClick={handleMarkAllCompleted}
              variant="outlined"
            >
              Mark all as completed
            </Button>
          </Box>
        </Box>
        {orderData.length > 0 ? (
          orderData.map((order: any, index: number) => {
            return (
              <OrderAccordion
                key={index}
                order={order}
                setNotification={setNotification}
                fetchOrders={fetchOrders}
              />
            );
          })
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mt={4}
          >
            <ErrorOutlineIcon sx={{ color: grey[600], fontSize: 50 }} />
            <Typography
              fontWeight="bold"
              sx={{ color: grey[600] }}
              variant="h4"
            >
              There is no orders
            </Typography>
          </Box>
        )}
      </Box>
    </Sidebar>
  );
}
