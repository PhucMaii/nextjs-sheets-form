'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Typography } from '@mui/material';
import OrderAccordion from '../components/OrderAccordion/OrderAccordion';
import { API_URL } from '../../utils/enum';
import axios from 'axios';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface Item {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  category: string;
  date: string;
  clientId: string;
  deliveryAddress: string;
  clientName: string;
  contactNumber: string;
  totalPrice: number;
  userId: number;
  items: Item[];
}

export default function MainPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderData, setOrderData] = useState<any>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_URL.ORDER);
      setOrderData(response.data.data);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to fetch orders: ', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
        <LoadingComponent color="blue" />
      </div>
    );
  }

  return (
    <Sidebar>
      <Box display="flex" width="100%" flexDirection="column" m={2} gap={2}>
        <Typography fontWeight="bold" variant="h4">
          Today&apos;s Order
        </Typography>
        {orderData.length > 0 &&
          orderData.map((order: Order, index: number) => {
            return <OrderAccordion key={index} order={order} />;
          })}
      </Box>
    </Sidebar>
  );
}
