'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  FormControl,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
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
import { formatDateChanged, generateRecommendDate } from '@/app/utils/time';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import { DropdownItemContainer } from './styled';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '@/app/theme/color';
import { pusherClient } from '@/app/pusher';
import { ComponentToPrint } from '../components/ComponentToPrint';
import useDebounce from '@/hooks/useDebounce';

interface Category {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface OrderPreference {
  id: number;
  isAutoPrint: boolean;
  orderId: number;
}

export interface Order {
  id: number;
  category: Category;
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
  OrderPreference?: OrderPreference[];
}

export default function Orders() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const [date, setDate] = useState(() => generateRecommendDate());
  const openDropdown = Boolean(actionButtonAnchor);
  const [currentStatus, setCurrentStatus] = useState<ORDER_STATUS>(
    ORDER_STATUS.INCOMPLETED,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [baseOrderData, setBaseOrderData] = useState<Order[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [searchKeywords, setSearchKeywords] = useState<string | undefined>();
  const componentRef: any = useRef();
  const singlePrint: any = useRef();

  const debouncedKeywords = useDebounce(searchKeywords, 500);
  console.log(debouncedKeywords, 'debounce keywords');

  // Scroll loading
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Subscribe admin whenever they logged in
  useEffect(() => {
    pusherClient.subscribe('admin');

    pusherClient.bind('incoming-order', (order: Order) => {
      setIncomingOrder(order);
    });

    return () => {
      pusherClient.unsubscribe('admin');
    };
  }, [date]);

  useEffect(() => {
    if (incomingOrder) {
      handleSinglePrint();
      setIncomingOrder(null);
      if (
        incomingOrder.deliveryDate === date &&
        incomingOrder.status === currentStatus
      ) {
        setOrderData((prevOrders) => [incomingOrder, ...prevOrders]);
        setBaseOrderData((prevOrders) => [incomingOrder, ...prevOrders]);
      }
    }
  }, [incomingOrder]);

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
    setHasMore(true); // setHasMore back to true whenever date change
  }, [date, currentStatus]);

  useEffect(() => {
    if (hasMore) {
      fetchOrders(page);
    }
  }, [page]);

  useEffect(() => {
      if (debouncedKeywords) {
        setIsLoading(true);
        const newOrderData = baseOrderData.filter((order: Order) => {
          if (
            order.clientId.includes(debouncedKeywords) ||
            debouncedKeywords == order.id.toString() ||
            order.clientName.toLowerCase().includes(debouncedKeywords.toLowerCase())
          ) {
            return true;
          }
          return false;
        });
        setOrderData(newOrderData);
        setIsLoading(false);
      } else if (debouncedKeywords === '') {
        setIsLoading(true);
        setOrderData(baseOrderData);
        setIsLoading(false);
      }

  }, [debouncedKeywords, baseOrderData]);

  const fetchOrders = async (currentPage: number): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL.ORDER}?date=${date}&page=${currentPage}&status=${currentStatus}`,
      );

      if (response.data.error) {
        setIsLoading(false);
        setHasMore(false);
        return;
      }

      if (currentPage === 1) {
        setOrderData(response.data.data);
        setBaseOrderData(response.data.data);
      } else {
        setOrderData((prevOrders) => [...prevOrders, ...response.data.data]);
        setBaseOrderData((prevOrders) => [
          ...prevOrders,
          ...response.data.data,
        ]);
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

  const handleUpdateUISingleOrder = (targetOrder: Order, targetItem: Item) => {
    const newOrderData: Order[] = orderData.map((order: Order) => {
      // If order is at targetOrder, then update
      if (order.id === targetOrder.id) {
        // update total price of the order
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

    setOrderData(newOrderData);
    setBaseOrderData(newOrderData);
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const handleDateChange = (e: any): void => {
    const formattedDate: string = formatDateChanged(e);

    setDate(formattedDate);
  };

  const handleMarkAllCompleted = async (): Promise<void> => {
    try {
      const response = await axios.put(API_URL.ORDER_STATUS, {
        status: ORDER_STATUS.COMPLETED,
        updatedOrders: orderData,
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
    setBaseOrderData(newOrders);
  };

  const handlePrinting = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleSinglePrint = useReactToPrint({
    content: () => singlePrint.current,
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

  const handleUpdateDateUI = (orderId: number, updatedDate: string): void => {
    const newOrders = orderData.filter((order) => {
      if (order.id !== orderId) {
        return true;
      }

      if (order.deliveryDate === updatedDate) {
        return true;
      }

      return false;
    });

    setOrderData(newOrders);
    setBaseOrderData(newOrders);
  };

  const actionDropdown = (
    <Box
      display="flex"
      justifyContent="right"
      alignItems="center"
      mt={2}
      gap={2}
    >
      {/* <Button variant="contained">Add +</Button> */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
        <Button
          aria-controls={openDropdown ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openDropdown ? 'true' : undefined}
          onClick={(e) => setActionButtonAnchor(e.currentTarget)}
          endIcon={<ArrowDownwardIcon />}
          variant="outlined"
        >
          Actions
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
              handlePrinting();
              handleCloseAnchor();
            }}
            disabled={orderData.length === 0}
          >
            <DropdownItemContainer display="flex" gap={2}>
              <PrintIcon sx={{ color: infoColor }} />
              <Typography>Print all</Typography>
            </DropdownItemContainer>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMarkAllCompleted();
              handleCloseAnchor();
            }}
            disabled={
              currentStatus === ORDER_STATUS.COMPLETED || orderData.length === 0
            }
          >
            <DropdownItemContainer display="flex" gap={2}>
              <CheckCircleIcon sx={{ color: successColor }} />
              <Typography>Mark all as completed</Typography>
            </DropdownItemContainer>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCurrentStatus(ORDER_STATUS.COMPLETED);
              handleCloseAnchor();
            }}
          >
            <DropdownItemContainer
              display="flex"
              gap={2}
              isSelected={currentStatus === ORDER_STATUS.COMPLETED}
            >
              <DoneIcon sx={{ color: successColor }} />
              <Typography>Filter: Completed Orders</Typography>
            </DropdownItemContainer>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCurrentStatus(ORDER_STATUS.INCOMPLETED);
              handleCloseAnchor();
            }}
          >
            <DropdownItemContainer
              display="flex"
              gap={2}
              isSelected={currentStatus === ORDER_STATUS.INCOMPLETED}
            >
              <PendingIcon sx={{ color: warningColor }} />
              <Typography>Filter: Incompleted Orders</Typography>
            </DropdownItemContainer>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCurrentStatus(ORDER_STATUS.VOID);
              handleCloseAnchor();
            }}
          >
            <DropdownItemContainer
              display="flex"
              gap={2}
              isSelected={currentStatus === ORDER_STATUS.VOID}
            >
              <BlockIcon sx={{ color: errorColor }} />
              <Typography>Filter: Void Orders</Typography>
            </DropdownItemContainer>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Sidebar>
        {orderData.length > 0 ? (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h4" fontWeight="bold">
                Orders
              </Typography>
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
            </Box>
            <Box
              display="flex"
              justifyContent="space-around"
              alignItems="center"
              mt={2}
              gap={4}
            >
              <TextField
                fullWidth
                variant="filled"
                label="Search orders"
                placeholder="Search by client id, invoice id, or client name"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
              />
              {actionDropdown}
            </Box>
            {orderData.map((order: any, index: number) => {
              return (
                <OrderAccordion
                  key={index}
                  order={order}
                  setNotification={setNotification}
                  updateUI={handleMarkSingleCompletedUI}
                  updateUIItem={handleUpdateUISingleOrder}
                  handleUpdateDateUI={handleUpdateDateUI}
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
      <div style={{ display: 'none' }}>
        <ComponentToPrint order={incomingOrder} ref={singlePrint} />
      </div>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight="bold">
          Orders
        </Typography>
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
      </Box>
      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        mt={2}
        gap={4}
      >
        <TextField
          fullWidth
          variant="filled"
          label="Search orders"
          placeholder="Search by client id, invoice id, or client name"
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
        />
        {actionDropdown}
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
              updateUIItem={handleUpdateUISingleOrder}
              handleUpdateDateUI={handleUpdateDateUI}
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
