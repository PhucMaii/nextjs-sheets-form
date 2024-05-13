'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Menu,
  MenuItem,
  Pagination,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { API_URL, ORDER_STATUS } from '../../utils/enum';
import axios from 'axios';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { useReactToPrint } from 'react-to-print';
import { AllPrint } from '../components/Printing/AllPrint';
import { Notification, UserType } from '@/app/utils/type';
import NotificationPopup from '../components/Notification';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { formatDateChanged, generateRecommendDate } from '@/app/utils/time';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PrintIcon from '@mui/icons-material/Print';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { DropdownItemContainer } from './styled';
import {
  infoColor,
  successColor,
} from '@/app/theme/color';
import { pusherClient } from '@/app/pusher';
import useDebounce from '@/hooks/useDebounce';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import OrderAccordion from '../components/OrderAccordion';
import AddOrder from '../components/Modals/AddOrder';
import ErrorComponent from '../components/ErrorComponent';
import AuthenGuard from '@/app/HOC/AuthenGuard';
import { Virtuoso } from 'react-virtuoso';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import moment from 'moment';
import { statusTabs } from '@/app/lib/constant';

interface Category {
  id: number;
  name: string;
}

export interface Item {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  user?: any;
  categoryId?: number;
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
  isReplacement?: boolean;
  isVoid?: boolean;
}

const orderPerPage = 10;

export default function Orders() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const [baseOrderData, setBaseOrderData] = useState<Order[]>([]);
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [date, setDate] = useState(() => generateRecommendDate());
  const openDropdown = Boolean(actionButtonAnchor);
  const [currentStatus, setCurrentStatus] = useState<ORDER_STATUS>(
    ORDER_STATUS.INCOMPLETED,
  );
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [pages, setPages] = useState<number>(0);
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string | undefined>();
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const componentRef: any = useRef();
  const totalPosition: any = useRef();

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    fetchAllClients();
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - 250);
  }, []);

  // Whenever base order data change, update the display order data
  useEffect(() => {
    if (baseOrderData.length > 0) {
      generateOrderData();
    } else {
      setOrderData([]);
    }
  }, [baseOrderData]);

  // Subscribe admin whenever they logged in
  useEffect(() => {
    pusherClient.subscribe('admin');
    pusherClient.subscribe('override-order');
    pusherClient.subscribe('void-order');

    pusherClient.bind('incoming-order', (order: Order) => {
      setIncomingOrder(order);
    });

    return () => {
      pusherClient.unsubscribe('admin');
      pusherClient.unsubscribe('override-order');
      pusherClient.unsubscribe('void-order');
    };
  }, [date]);

  // whenever current page change and not in searching mode, then update the display data
  useEffect(() => {
    if (!isSearching) {
      generateOrderData();
    }
  }, [currentPage, isSearching]);

  // Pre set current page to 1 whenever there is search key words
  useEffect(() => {
    if (searchKeywords) {
      setCurrentPage(1);
    }
  }, [searchKeywords]);

  useEffect(() => {
    setCurrentStatus(statusTabs[tabIndex].value);
  }, [tabIndex])

  useEffect(() => {
    if (totalPosition.current) {
      const currentOffSetHeight = window.innerHeight;
      setVirtuosoHeight(
        currentOffSetHeight -
          totalPosition.current?.getBoundingClientRect().bottom,
      );
    }
  }, [totalPosition]);

  useEffect(() => {
    if (incomingOrder) {
      setIncomingOrder(null);
      if (
        incomingOrder.deliveryDate === date &&
        incomingOrder.status === currentStatus &&
        !incomingOrder.isReplacement
      ) {
        setBaseOrderData((prevOrders) => [incomingOrder, ...prevOrders]);
      } else if (incomingOrder.isReplacement || incomingOrder.isVoid) {
        const newOrderData = orderData.filter((order: Order) => {
          return order.id !== incomingOrder.id;
        });
        setBaseOrderData([incomingOrder, ...newOrderData]);
      }
    }
  }, [incomingOrder]);

  useEffect(() => {
    fetchOrders();
  }, [date, currentStatus]);

  useEffect(() => {
    if (debouncedKeywords) {
      setIsSearching(true);
      const newOrderData = baseOrderData.filter((order: Order) => {
        if (
          order.clientId.includes(debouncedKeywords) ||
          debouncedKeywords == order.id.toString() ||
          order.clientName
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
      generateOrderData(newOrderData);
    } else {
      setIsSearching(false);
      if (baseOrderData.length > 0) {
        generateOrderData();
      }
    }
  }, [debouncedKeywords, baseOrderData]);

  const addOrder = async (
    clientValue: UserType | null,
    deliveryDate: string,
    note: string,
    itemList: any,
  ) => {
    try {
      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      // Format data to have the same structure as backend
      let submittedData: any = {
        ['DELIVERY DATE']: deliveryDate,
        ['NOTE']: note,
        orderTime: `${timeString} ${dateString}`,
      };

      for (const item of itemList) {
        submittedData = { ...submittedData, [item.name]: item.quantity };
      }

      const response = await axios.post(
        `${API_URL.IMPORT_SHEETS}?userId=${clientValue?.id}`,
        submittedData,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      if (response.data.warning) {
        setNotification({
          on: true,
          type: 'warning',
          message: response.data.warning,
        });
        return;
      }

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log(error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      return;
    }
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

  const fetchOrders = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL.ORDER}?date=${date}&status=${currentStatus}`,
      );

      if (response.data.error) {
        setIsLoading(false);
        return;
      }

      setPages(Math.ceil(response.data.data.length / orderPerPage));
      setBaseOrderData(response.data.data);
      setIsLoading(false);
      setCurrentPage(1);
    } catch (error: any) {
      console.log('Fail to fetch orders: ', error);
      setIsLoading(false);
      return;
    }
  };

  const generateOrderData = (orderList = baseOrderData) => {
    const newNumberOfPages = Math.ceil(orderList.length / orderPerPage);
    setPages(newNumberOfPages);
    setOrderData(
      orderList.slice(
        orderPerPage * currentPage - orderPerPage,
        orderPerPage * currentPage,
      ),
    );
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

    // setOrderData(newOrderData);
    setBaseOrderData(newOrderData);
  };

  const handleUpdatePriceUI = (
    targetOrder: Order,
    newItems: any[],
    newTotalPrice: number,
  ) => {
    const newBaseOrderList = baseOrderData.map((order: Order) => {
      if (order.id === targetOrder.id) {
        return { ...order, totalPrice: newTotalPrice, items: newItems };
      }
      return order;
    });
    setBaseOrderData(newBaseOrderList);
  };

  const handleSelectOrder = (e: any, targetOrder: Order) => {
    e.stopPropagation();
    e.preventDefault();
    const selectedOrder = selectedOrders.find((order: Order) => {
      return order.id === targetOrder.id;
    });

    if (selectedOrder) {
      const newSelectedOrders = selectedOrders.filter((order: Order) => {
        return order.id !== targetOrder.id;
      });
      setSelectedOrders(newSelectedOrders);
    } else {
      setSelectedOrders([...selectedOrders, targetOrder]);
    }
  };

  const handleSelectAll = (e: any) => {
    e.preventDefault();
    if (selectedOrders.length === orderData.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orderData);
    }
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
        updatedOrders: selectedOrders.length > 0 ? selectedOrders : orderData,
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

  const handleMarkSingleCompletedUI = (orderId: number): void => {
    const newOrders = orderData.filter((order) => order.id !== orderId);
    setOrderData(newOrders);
    setBaseOrderData(newOrders);
  };

  const handlePrintAll = useReactToPrint({
    content: () => componentRef.current,
  });

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
            handlePrintAll();
            handleCloseAnchor();
          }}
          disabled={orderData.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <PrintIcon sx={{ color: infoColor }} />
            <Typography>Print bills</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem onClick={() => setIsAddOrderOpen(true)}>
          <DropdownItemContainer display="flex" gap={2}>
            <PostAddIcon sx={{ color: infoColor }} />
            <Typography>Add Order</Typography>
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
      </Menu>
    </Box>
  );

  const constantComponent = (
    <>
      <NotificationPopup
          notification={notification}
          onClose={() => setNotification({ ...notification, on: false })}
        />
        <div style={{ display: 'none' }}>
          <AllPrint
            orders={selectedOrders.length > 0 ? selectedOrders : orderData}
            ref={componentRef}
          />
        </div>
        <AddOrder
          open={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          clientList={clientList}
          setNotification={setNotification}
          currentDate={date}
          createOrder={addOrder}
        />

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
        <Grid container alignItems="center" mt={2} spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              name="Search"
              variant="filled"
              // label="Search orders"
              placeholder="Search by client id, invoice id, or client name"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid item xs={2} md={1} textAlign="right">
            <LoadingButton
              disabled={orderData.length === baseOrderData.length}
              loading={isLoading}
              loadingIndicator="Refresh..."
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              <RefreshIcon />
            </LoadingButton>
          </Grid>
          <Grid item xs={4} md={3}>
            {actionDropdown}
          </Grid>
        </Grid>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="basic tabs"
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="fullWidth"
            sx={{width: '100%'}}
          >
            {statusTabs &&
              statusTabs.map((statusTab: any, index: number) => {
                return (
                  <Tab
                    key={index}
                    icon={<statusTab.icon />}
                    id={`simple-tab-${index}`}
                    label={`${statusTab.name} ${tabIndex === index ? `(${isLoading ? 0 : baseOrderData.length})` : ''} `}
                    aria-controls={`tabpanel-${index}`}
                    value={index}
                    sx={{ 
                      "&.Mui-selected": { color: statusTab.color},
                    }}
                  />
                );
              })}
          </Tabs>
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={orderData.length === selectedOrders.length}
                onClick={handleSelectAll}
              />
            }
            label="Select All"
          />
        </Box>
    </>
  )

  // if (isLoading) {
  //   return (
  //     <Sidebar>
  //       {constantComponent}
  //       <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
  //         <LoadingComponent color="blue" />
  //       </div>
  //     </Sidebar>
  //   );
  // }

  return (
    <Sidebar>
      <AuthenGuard>
        {
          isLoading ? (
            <>
            {constantComponent}
            <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
              <LoadingComponent color="blue" />
            </div>
          </>
          ) : (
            <>
       {constantComponent}
        {orderData.length > 0 ? (
          <>
            <Virtuoso
              totalCount={orderData.length}
              style={{ height: virtuosoHeight }}
              data={orderData}
              itemContent={(index, order) => {
                return (
                  <OrderAccordion
                    key={index}
                    order={order}
                    setNotification={setNotification}
                    updateUI={handleMarkSingleCompletedUI}
                    updateUIItem={handleUpdateUISingleOrder}
                    handleUpdateDateUI={handleUpdateDateUI}
                    handleUpdatePriceUI={handleUpdatePriceUI}
                    selectedOrders={selectedOrders}
                    handleSelectOrder={handleSelectOrder}
                  />
                );
              }}
            />
            <div style={{ width: '100%' }}>
              <Pagination
                count={pages}
                shape="rounded"
                size="large"
                onChange={(e: any, value: number) => setCurrentPage(value)}
              />
            </div>
          </>
        ) : (
          <ErrorComponent errorText="There is no orders" />
        )}
            </>
          )
        }
      </AuthenGuard>
    </Sidebar>
  );
}
