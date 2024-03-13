'use client';
import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Typography } from '@mui/material';
import OrderAccordion from '../components/OrderAccordion/OrderAccordion';
import { API_URL } from '../../utils/enum';
import axios from 'axios';

export default function MainPage() {
  useEffect(() => {
    fetchOrders();
  }, [])
  const data = [
    {
      clientName: 'Little Minh',
      clientAddress: '7533 Market Crossing, Burnaby, BC V3M 2E1',
      contactNumber: '111111',
      category: 'Special Customers',
      orderDate: '03/11/2024',
      totalPrice: 300,
    },
    {
      clientName: 'Pho Mr Do',
      clientAddress: 'Vancouver BC',
      contactNumber: '111111',
      category: 'Restaurant',
      orderDate: '03/11/2024',
      totalPrice: 530,
    },
    {
      clientName: 'Costco',
      clientAddress: 'Chinatown',
      contactNumber: '111111',
      category: 'Supermarket',
      orderDate: '03/11/2024',
      totalPrice: 600,
    }
  ];

  const fetchOrders = async () => {
    try {
      const orders = await axios.get(API_URL.ORDER);
      console.log(orders, 'orders');
    } catch (error: any) {
      console.log('Fail to fetch orders: ', error);
    }
  }

  return (
    <Sidebar>
      <Box display="flex" width="100%" flexDirection="column" m={2} gap={2}>
        <Typography fontWeight="bold" variant="h4">
          Today&apos;s Order
        </Typography>
        <OrderAccordion />
        <OrderAccordion />
      </Box>
    </Sidebar>
  );
}