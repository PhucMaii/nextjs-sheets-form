'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Checkbox,
  Fab,
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
import {
  API_URL,
  FLAG_ORDER_TYPE,
  ORDER_STATUS,
  USER_ROLE,
} from '../../utils/enum';
import axios from 'axios';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { AllPrint } from '../components/Printing/AllPrint';
import { Notification, OrderedItems, UserType } from '@/app/utils/type';
import NotificationPopup from '../components/Notification';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  formatDateChanged,
  generateRecommendDate,
  YYYYMMDDFormat,
} from '@/app/utils/time';
import { pusherClient } from '@/app/pusher';
import OrderAccordion from '../components/OrderAccordion';
import AddOrder from '../components/Modals/add/AddOrder';
import ErrorComponent from '../components/ErrorComponent';
import { Virtuoso } from 'react-virtuoso';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import moment from 'moment';
import { statusTabs } from '@/app/lib/constant';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SearchModal from '../components/Modals/SearchModal';
import useDebounce from '@/hooks/useDebounce';
import OrderOverview from '../components/OrderOverview';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useReactToPrint } from 'react-to-print';
import { SWRFetchData } from '@/app/utils/db';
import { getSameDateLastWeek } from '@/pages/api/utils/date';

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
  // subCategoryId?: number;
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
  deliveryAddressLng?: number;
  deliveryAddressLat?: number;
  clientName: string;
  contactNumber: string;
  totalPrice: number;
  userId: number;
  items: Item[];
  note: string;
  status: ORDER_STATUS;
  isReplacement?: boolean;
  isVoid?: boolean;
  routeId?: number;
  route?: any;
  preference?: any;
  createdBy?: string;
  updatedBy?: string;
}

const orderPerPage = 10;

export default function Orders() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [baseOrderData, setBaseOrderData] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [date, setDate] = useState(() => generateRecommendDate());
  const [currentStatus, setCurrentStatus] = useState<ORDER_STATUS>(
    ORDER_STATUS.NONE,
  );
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  // Data Fetching
  const [orders, mutate, isValidating] = SWRFetchData(
    `${API_URL.ORDER}?date=${date}&status=${currentStatus}`,
  );

  const sameDateLastWeek = getSameDateLastWeek(date);
  const stringifyDate = YYYYMMDDFormat(sameDateLastWeek);

  const [lastWeekOrders] = SWRFetchData(
    `${API_URL.ORDER}?date=${stringifyDate}&status=${currentStatus}`,
  );
  const [clients] = SWRFetchData(API_URL.CLIENTS);
  // const [subCategories] = SWRFetchData(API_URL.SUBCATEGORIES);

  useEffect(() => {
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - 250);
  }, []);

  useEffect(() => {
    if (isLoading && !isValidating) {
      setIsLoading(false);
    }

    if (!orders && isValidating) {
      setIsLoading(true);
    }
  }, [isValidating, isLoading, date, currentStatus]);

  useEffect(() => {
    if (orders) {
      initializeOrder();
    }
  }, [orders, date, currentStatus]);

  useEffect(() => {
    setSelectedOrders([]);
  }, [date, currentStatus]);

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
      mutate();
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
  }, [debouncedKeywords, baseOrderData]);

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

  const addOrder = async (
    clientValue: UserType | null,
    deliveryDate: string,
    note: string,
    itemList: any,
    isCheckUnavailableRange: boolean = true,
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
        isCheckUnavailableRange,
      };

      for (const item of itemList) {
        submittedData = { ...submittedData, [item.name]: item.quantity };
      }

      const response = await axios.post(
        `${API_URL.IMPORT_SHEETS}?userId=${clientValue?.id}`,
        { ...submittedData, createdBy: USER_ROLE.ADMIN },
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
        if (response.data.flag === FLAG_ORDER_TYPE.ALREADY_ORDER) {
          setNotification({
            on: true,
            type: 'warning',
            message: response.data.warning,
          });
          return;
        } else {
          return response;
        }
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
        message:
          'There was an error creating order: ' + error.response.data.error,
      });
      return;
    }
  };

  const initializeOrder = () => {
    setPages(Math.ceil(orders.data / orderPerPage));
    setBaseOrderData(orders.data);
    setCurrentPage(1);
  };

  const generateOrderData = (orderList = baseOrderData) => {
    if (!orderList || orderList.length === 0) {
      setOrderData([]);
      return;
    }
    const newNumberOfPages = Math.ceil(orderList.length / orderPerPage);
    setPages(newNumberOfPages);
    setOrderData(
      orderList.slice(
        orderPerPage * currentPage - orderPerPage,
        orderPerPage * currentPage,
      ),
    );
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const handleUpdateItem = async (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => {
    try {
      // const orderTotalPrice = calculateNewTotalPrice();
      const response = await axios.put(`${API_URL.ORDERED_ITEMS}/single`, {
        ...updatedItem,
        orderId: order.id,
        orderTotalPrice,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      // Optimistic uupdate
      handleUpdateUISingleOrder(order, response.data.data);

      // Mutate to update real data
      mutate();

      setNotification({
        on: true,
        type: 'success',
        message: 'Update Item Successfully',
      });
    } catch (error: any) {
      console.log('Fail to update order items: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update order items: ' + error,
      });
    }
  };

  const handleUpdateUISingleOrder = (targetOrder: Order, targetItem: Item) => {
    const newOrderData: Order[] = baseOrderData.map((order: Order) => {
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

    setBaseOrderData(newOrderData);
  };

  const handleUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
    try {
      // setIsUpdating(true);
      const response = await axios.put(API_URL.ORDER_STATUS, {
        status,
        updatedOrders: selectedOrders,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        // setIsUpdating(false);
        return;
      }

      mutate();
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      // setIsUpdating(false);
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Something went wrong: ' + error.response.data.error,
      });
      // setIsUpdating(false);
    }
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

  const handleUpdateStatusUI = (targetOrder: Order): void => {
    let newOrders = [];
    if (tabIndex !== 0 && targetOrder.status !== currentStatus) {
      newOrders = baseOrderData.filter((order) => order.id !== targetOrder.id);
    } else {
      newOrders = baseOrderData.map((order) => {
        if (order.id === targetOrder.id) {
          return targetOrder;
        }
        return order;
      });
    }
    setBaseOrderData(newOrders);
  };

  const handlePrintAll = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleUpdateDateUI = (orderId: number, updatedDate: string): void => {
    const newOrders = baseOrderData.filter((order) => {
      if (order.id !== orderId) {
        return true;
      }

      if (order.deliveryDate === updatedDate) {
        return true;
      }

      return false;
    });

    setBaseOrderData(newOrders);
  };

  const actionDropdown = (
    <Box
      display="flex"
      justifyContent="flex-end"
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
        disabled={selectedOrders.length === 0}
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
          <Typography>Print bills</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.INCOMPLETED);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.INCOMPLETED}
        >
          <Typography>Mark as incompleted</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.DELIVERED);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.DELIVERED}
        >
          <Typography>Mark as delivered</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.COMPLETED);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.COMPLETED}
        >
          <Typography>Mark as completed</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.VOID);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.VOID}
        >
          <Typography>Mark as void</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );

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
      <OrderOverview
        baseOrderData={baseOrderData}
        allRouteOrderData={orders ? orders.data : []}
        lastWeekOrderData={lastWeekOrders ? lastWeekOrders.data : []}
        currentDate={date}
      />
      <Grid container alignItems="center" spacing={1}>
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
        <Grid item lg={1.5} md={12} xs={12} textAlign="right">
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
            sx={{ width: '100% !important' }}
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
            label="Search orders"
            placeholder="Search by invoice id, client id, client name or status"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={orderData.length === selectedOrders.length}
                onClick={handleSelectAll}
              />
            }
            label="Select All"
          />
        </Grid>
        <Grid item xs={6} textAlign="right">
          {actionDropdown}
        </Grid>
      </Grid>
    </>
  );

  return (
    <Sidebar>
      {/* <LoadingModal open={isUpdating} /> */}
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
        clientList={clients?.data || []}
        setNotification={setNotification}
        currentDate={date}
        createOrder={addOrder}
      />
      <SearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        baseOrderList={baseOrderData}
        setNotification={setNotification}
        handleUpdateStatusUI={handleUpdateStatusUI}
        mutateOrders={mutate}
        handleUpdateDateUI={handleUpdateDateUI}
        handleUpdatePriceUI={handleUpdatePriceUI}
        selectedOrders={selectedOrders}
        handleSelectOrder={handleSelectOrder}
        // subcategories={subCategories?.data || []}
        handleUpdateItem={handleUpdateItem}
      />
      {isLoading ? (
        <>
          {uppperContent}
          <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
            <LoadingComponent />
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
                      handleUpdateStatusUI={handleUpdateStatusUI}
                      // updateUIItem={handleUpdateUISingleOrder}
                      handleUpdateDateUI={handleUpdateDateUI}
                      handleUpdatePriceUI={handleUpdatePriceUI}
                      selectedOrders={selectedOrders}
                      handleSelectOrder={handleSelectOrder}
                      handleUpdateItem={handleUpdateItem}
                      mutateOrders={mutate}
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
