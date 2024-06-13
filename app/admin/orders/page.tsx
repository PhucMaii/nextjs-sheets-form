'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Checkbox,
  Fab,
  FormControl,
  FormControlLabel,
  Grid,
  Pagination,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { API_URL, ORDER_STATUS, PAYMENT_TYPE } from '../../utils/enum';
import axios from 'axios';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { AllPrint } from '../components/Printing/AllPrint';
import { Notification, UserType } from '@/app/utils/type';
import NotificationPopup from '../components/Notification';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { formatDateChanged, generateRecommendDate } from '@/app/utils/time';
import { pusherClient } from '@/app/pusher';
import OrderAccordion from '../components/OrderAccordion';
import AddOrder from '../components/Modals/add/AddOrder';
import ErrorComponent from '../components/ErrorComponent';
import { Virtuoso } from 'react-virtuoso';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import moment from 'moment';
import { statusTabs } from '@/app/lib/constant';
import useClients from '@/hooks/fetch/useClients';
import useSubCategories from '@/hooks/fetch/useSubCategories';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import SearchModal from '../components/Modals/SearchModal';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { ShadowSection } from '../reports/styled';
import { blue, blueGrey } from '@mui/material/colors';
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
  subCategoryId?: number;
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
  subCategoryId?: number;
  subCategory?: any;
  routeId?: number;
  route?: any;
  preference?: any;
}

const orderPerPage = 10;

export default function Orders() {
  const [baseOrderData, setBaseOrderData] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [date, setDate] = useState(() => generateRecommendDate());
  const [currentStatus, setCurrentStatus] = useState<ORDER_STATUS>(
    ORDER_STATUS.NONE,
  );
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [pages, setPages] = useState<number>(0);
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const componentRef: any = useRef();
  const totalPosition: any = useRef();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const { clientList } = useClients();
  const { subCategories } = useSubCategories();

  useEffect(() => {
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

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = baseOrderData.filter((order: Order) => {
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
      setOrderData(newOrderList);
      setPages(1);
    } else {
      generateOrderData();
    }
  }, [debouncedKeywords]);

  // whenever current page change and not in searching mode, then update the display data
  useEffect(() => {
    generateOrderData();
  }, [currentPage]);

  useEffect(() => {
    setCurrentStatus(statusTabs[tabIndex].value);
  }, [tabIndex]);

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
      if (
        incomingOrder.deliveryDate === date &&
        (incomingOrder.status === currentStatus || tabIndex === 0) &&
        !incomingOrder.isReplacement
      ) {
        setBaseOrderData((prevOrders) => [incomingOrder, ...prevOrders]);
      } else if (incomingOrder.isReplacement || incomingOrder.isVoid) {
        const newOrderData = baseOrderData.filter((order: Order) => {
          return order.id !== incomingOrder.id;
        });
        setBaseOrderData([incomingOrder, ...newOrderData]);
      }
      setIncomingOrder(null);
    }
  }, [incomingOrder]);

  useEffect(() => {
    fetchOrders();
  }, [date, currentStatus]);

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

  const generateOverview = () => {
    const titleColor = blueGrey[50];
    const dataColor = 'white';

    const openBill = baseOrderData.filter((order: Order) => {
      return (
        order.status === ORDER_STATUS.INCOMPLETED ||
        order.status === ORDER_STATUS.DELIVERED
      );
    });

    const totalBill =
      openBill.length > 0
        ? openBill.reduce((acc: number, order: Order) => {
            return acc + order.totalPrice;
          }, 0)
        : 0;

    const codOrders = baseOrderData.filter((order: Order) => {
      return order?.preference?.paymentType === PAYMENT_TYPE.COD;
    });

    const codBill =
      codOrders.length > 0
        ? codOrders.reduce((acc: number, order: Order) => {
            return acc + order.totalPrice;
          }, 0)
        : 0;

    return (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <RequestQuoteIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              Bill
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {openBill.length}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Open Bill
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <AttachMoneyIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              Balance Due
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {totalBill.toFixed(2)}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Balance due
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <CalendarTodayIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              COD ($)
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {codBill.toFixed(2)}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Bill
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1.5}
        >
          <Box display="flex" gap={1} alignItems="center">
            <CalendarTodayIcon sx={{ color: `${dataColor} !important` }} />
            <Typography
              variant="subtitle1"
              sx={{ color: `${titleColor} !important`, fontWeight: 700 }}
            >
              COD
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: `${dataColor} !important` }}
          >
            {codOrders.length}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: `${titleColor} !important` }}
          >
            Orders
          </Typography>
        </Box>
      </Box>
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
        return { ...targetOrder, totalPrice: newTotalPrice, items: newItems };
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

  const handleDateChange = (e: any): void => {
    const formattedDate: string = formatDateChanged(e);

    setDate(formattedDate);
  };

  const handleMarkSingleCompletedUI = (targetOrder: Order): void => {
    let newOrders = [];
    if (tabIndex !== 0 && targetOrder.status !== currentStatus) {
      newOrders = orderData.filter((order) => order.id !== targetOrder.id);
    } else {
      newOrders = orderData.map((order) => {
        if (order.id === targetOrder.id) {
          return targetOrder;
        }
        return order;
      });
    }
    setOrderData(newOrders);
    setBaseOrderData(newOrders);
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

  const uppperContent = (
    <>
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
      <ShadowSection sx={{ backgroundColor: `${blue[800]} !important` }}>
        {generateOverview()}
      </ShadowSection>
      <Grid container alignItems="center">
        <Grid item xs={12} md={10.5}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              aria-label="basic tabs"
              value={tabIndex}
              onChange={(e, newValue) => setTabIndex(newValue)}
              variant="fullWidth"
              sx={{ width: '100%' }}
            >
              {statusTabs &&
                statusTabs.map((statusTab: any, index: number) => {
                  return (
                    <Tab
                      key={index}
                      icon={<statusTab.icon />}
                      id={`simple-tab-${index}`}
                      label={`${statusTab.name} ${
                        tabIndex === index ? `(${baseOrderData.length})` : ''
                      } `}
                      aria-controls={`tabpanel-${index}`}
                      value={index}
                      sx={{
                        '&.Mui-selected': { color: statusTab.color },
                        fontWeight: 600,
                      }}
                    />
                  );
                })}
            </Tabs>
          </Box>
        </Grid>
        <Grid item xs={1.5} textAlign="right">
          <Box
            display="flex"
            justifyContent="right"
            alignItems="center"
            gap={2}
          >
            <Fab
              size="medium"
              sx={{ backgroundColor: 'white' }}
              onClick={() => setIsSearchModalOpen(true)}
            >
              <SearchIcon />
            </Fab>
            <Fab
              size="medium"
              color="primary"
              onClick={() => setIsAddOrderOpen(true)}
            >
              <AddIcon />
            </Fab>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="filled"
            // label="Search orders"
            placeholder="Search by invoice id, client id, client name or status"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
          />
        </Grid>
      </Grid>
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
  );

  return (
    <Sidebar>
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
        clientList={clientList || []}
        setNotification={setNotification}
        currentDate={date}
        createOrder={addOrder}
      />
      <SearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        baseOrderList={baseOrderData}
        setNotification={setNotification}
        updateUI={handleMarkSingleCompletedUI}
        updateUIItem={handleUpdateUISingleOrder}
        handleUpdateDateUI={handleUpdateDateUI}
        handleUpdatePriceUI={handleUpdatePriceUI}
        selectedOrders={selectedOrders}
        handleSelectOrder={handleSelectOrder}
        subcategories={subCategories || []}
      />
      {isLoading ? (
        <>
          {uppperContent}
          <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
            <LoadingComponent color="blue" />
          </div>
        </>
      ) : (
        <>
          {uppperContent}
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
                      subcategories={subCategories || []}
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
      )}
    </Sidebar>
  );
}
