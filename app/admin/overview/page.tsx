'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, FormControl, Typography } from '@mui/material';
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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { YYYYMMDDFormat } from '@/app/utils/time';

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
  const [date, setDate] = useState(() => {
    const dateObj = new Date();
    const formattedDate = YYYYMMDDFormat(dateObj);
    return formattedDate;
  });
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const componentRef: any = useRef();

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setPage(1);
    fetchOrders(1);
    setHasMore(true); // setHasMore back to true whenever date change
  }, [date])

  useEffect(() => {
    if (hasMore) {
      fetchOrders(page);
    }
  }, [page]);


  const fetchOrders = async (currentPage: number): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL.ORDER}?date=${date}&page=${currentPage}`,
      );

      if (response.data.error) {
        setIsLoading(false);
        setHasMore(false);
        return;
      }

      if (currentPage === 1) {
        setOrderData(response.data.data);
      } else {
        setOrderData((prevOrders) => [...prevOrders, ...response.data.data]);
      }
      setIsLoading(false);

      if (response.data.data.length === 0) {
        setHasMore(false);
      }
    } catch (error: any) {
      console.log('Fail to fetch orders: ', error);
      setIsLoading(false);
      setHasMore(false);
      return;
    }
  };
  
  const handleDateChange = (e: any): void => {
    const dateObj = new Date(e.$d);

    const formattedDate = YYYYMMDDFormat(dateObj);

    setDate(formattedDate);
  };

  const handleMarkAllCompleted = async (): Promise<void> => {
    try {
      const response = await axios.put(API_URL.ORDER_STATUS, {
        status: ORDER_STATUS.COMPLETED,
      });
      await fetchOrders(1);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
    }
  };

  const handleMarkSingleCompletedUI = (orderId: number): void => {
    const newOrders = orderData.filter((order) => order.id !== orderId);
    setOrderData(newOrders);
  };

  const handlePrinting = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleScroll = (): void => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
          {orderData.length > 0 ? (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormControl>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date Filter"
                      value={dayjs(date)}
                      onChange={(e: any) => handleDateChange(e)}
                      sx={{
                        borderRadius: 2,
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
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
              {orderData.map((order: any, index: number) => {
                return (
                  <OrderAccordion
                    key={index}
                    order={order}
                    setNotification={setNotification}
                    updateUI={handleMarkSingleCompletedUI}
                  />
                );
              })}
              <LoadingComponent color="blue" />
            </>
          ) : (
            <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
              <LoadingComponent color="blue" />
            </div>
          )}
      </Sidebar>
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date Filter"
              value={dayjs(date)}
              onChange={(e: any) => handleDateChange(e)}
              sx={{
                borderRadius: 2,
              }}
            />
          </LocalizationProvider>
        </FormControl>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
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
              // fetchOrders={fetchOrders}
              updateUI={handleMarkSingleCompletedUI}
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
          <Typography fontWeight="bold" sx={{ color: grey[600] }} variant="h4">
            There is no orders
          </Typography>
        </Box>
      )}
    </Sidebar>
  );
}
