'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Checkbox,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  ORDER_STATUS,
  PAYMENT_TYPE,
  TYPE,
  getAdminApiUrl,
} from '@/app/utils/enum';
import axios from 'axios';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { IItem, IRoutes } from '@/app/utils/type';
import { getWCODDay, YYYYMMDDFormat } from '@/app/utils/time';
import { pusherClient } from '@/app/pusher';
import OrderAccordion from '../components/OrderAccordion';
import AddOrder from '../components/Modals/add/AddOrder';
import ErrorComponent from '../components/ErrorComponent';
import { Virtuoso } from 'react-virtuoso';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import { days, statusTabs } from '@/app/lib/constant';
import AddIcon from '@mui/icons-material/Add';
import useDebounce from '@/hooks/useDebounce';
import OrderOverview from '../components/Overview/OrderOverview';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useReactToPrint } from 'react-to-print';
import { SWRFetchData } from '@/app/utils/db';
import { getSameDateLastWeek } from '@/pages/api/utils/date';
import { blueGrey, grey } from '@mui/material/colors';
import TuneIcon from '@mui/icons-material/Tune';
import useSelectDate from '@/hooks/useSelectDate';
import useNotification from '@/hooks/useNotification';
import { filterByRoute } from '@/app/utils/array';
import { updateStatus } from '@/app/utils/orders';
import OrderDetails from '../components/Modals/OrderDetails';
import { DropdownItemContainer } from './styled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '@/theme/color';
import LoadingModal from '../components/Modals/LoadingModal';
import { MemoizedAllPrint } from '../components/Printing/AllPrint';
import { useParams } from 'next/navigation';

interface Category {
  id: number;
  name: string;
}

export interface Item extends IItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  inventoryItemId: number;
  inventoryUnitId: number;
  inventoryItem?: any;
  unit?: any;
  totalPrice: number;
  totalPrevPrice?: number;
  isCustomAmount?: boolean;
  option?: any;
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
  subTotal?: number;
  PST?: number;
  GST?: number;
  discount?: number;
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
  previousUnpaidOrders?: { numberOfOrders: number; totalPrice: number };
  multipleOrders?: boolean;
  isAffectInventory?: boolean;
  orderRoute?: string;
  type?: TYPE;
  deliveredBy?: string;
  notInRoute?: boolean;
  notInBoard?: boolean;
  addedToCODBy?: string;
  cost?: number;
  profit?: number;
}

const orderPerPage = 10;

export default function Orders() {
  const { companyId }: any = useParams();

  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(filterAnchor);
  const [baseOrderData, setBaseOrderData] = useState<Order[]>([]);
  const [currentRoute, setCurrentRoute] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentStatus, setCurrentStatus] = useState<ORDER_STATUS>(
    ORDER_STATUS.NONE,
  );
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<PAYMENT_TYPE[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  // const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [routeOrders, setRouteOrders] = useState<Order[]>([]);
  const [pages, setPages] = useState<number>(0);
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<Order | null>(null);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const componentRef: any = useRef();
  const totalPosition: any = useRef();

  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const { date, SelectDate } = useSelectDate();
  const { showNotification, NotificationComp } = useNotification();

  const wcodDay: any = useMemo(() => {
    const day = getWCODDay(date);
    return day;
  }, [date]);

  // Data Fetching
  // const [orders, mutate, isValidating] = SWRFetchData(
  //   getAdminApiUrl(companyId, `/orders?date=${date}&status=${currentStatus}`),
  // );
  const [orders, mutate, isValidating] = SWRFetchData(
    getAdminApiUrl(companyId, `/orders?date=${date}&status=${currentStatus}`),
  );

  // console.log(orders, 'orders');

  const selectedDate = new Date(date);
  const [routes] = SWRFetchData(
    getAdminApiUrl(companyId, `/routes?day=${days[selectedDate.getDay()]}`),
  );

  const sameDateLastWeek = getSameDateLastWeek(date);
  const stringifyDate = YYYYMMDDFormat(sameDateLastWeek);

  const [lastWeekOrders] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/orders?date=${stringifyDate}&status=${currentStatus}`,
    ),
  );
  const [clients] = SWRFetchData(getAdminApiUrl(companyId, '/clients'));

  useEffect(() => {
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - 250);
  }, []);

  useEffect(() => {
    setCurrentRoute(0);
  }, [date]);

  useEffect(() => {
    if (orders && !isValidating) {
      setIsLoading(false);
    } else if (!orders && isValidating) {
      setIsLoading(true);
    }
  }, [isValidating, date, currentStatus, currentRoute]);

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
    pusherClient?.subscribe(`admin-${companyId}`);
    pusherClient?.subscribe(`override-order-${companyId}`);
    pusherClient?.subscribe(`void-order-${companyId}`);

    pusherClient?.bind('incoming-order', (order: Order) => {
      setIncomingOrder(order);
      mutate();
    });

    return () => {
      pusherClient?.unsubscribe(`admin-${companyId}`);
      pusherClient?.unsubscribe(`override-order-${companyId}`);
      pusherClient?.unsubscribe(`void-order-${companyId}`);
    };
  }, [date]);

  useEffect(() => {
    if (debouncedKeywords) {
      let baseOrders = baseOrderData;

      if (currentRoute > 0) {
        baseOrders = filterOrderByRoute(baseOrderData);
      }
      const newOrderList = baseOrders.filter((order: Order) => {
        if (
          order?.user?.clientId.includes(debouncedKeywords) ||
          debouncedKeywords == order.id.toString() ||
          order?.user?.clientName
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase()) ||
          order?.orderRoute
            ?.toLowerCase()
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
  }, [debouncedKeywords, baseOrderData, currentRoute]);

  // whenever current page change and not in searching mode, then update the display data
  useEffect(() => {
    generateOrderData();
  }, [currentRoute, currentPage, filterOptions]);

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

  const filterOrderByRoute = (orders: Order[]) => {
    if (!routes || !orders || orders.length === 0) {
      return [];
    }

    if (currentRoute === 0) {
      return baseOrderData;
    }

    // Get the route
    const targetRoute = routes.data.find(
      (route: IRoutes) => route.id === currentRoute,
    );

    // Get clients from that route -> get orders
    const filteredOrders: any = filterByRoute(orders, targetRoute);

    setRouteOrders(filteredOrders);
    return filteredOrders;
  };

  const initializeOrder = () => {
    setPages(Math.ceil(orders.data / orderPerPage));
    setBaseOrderData([...(orders?.data || [])]);
    setCurrentPage(1);
    if (selectedOrderDetails) {
      const updatedOrderDetails = orders.data.find(
        (order: Order) => order.id === selectedOrderDetails.id,
      );

      if (updatedOrderDetails) {
        setSelectedOrderDetails(updatedOrderDetails);
      }
    }
  };

  const generateOrderData = (orderList = baseOrderData) => {
    if (!orderList || orderList.length === 0) {
      setOrderData([]);
      return;
    }

    // If there is route selected -> filter order based on that route
    let orders = [...orderList];
    if (currentRoute > 0) {
      orders = filterOrderByRoute(orders);
    }

    if (filterOptions.length > 0) {
      orders = filterByPaymentType(orders, filterOptions);
    }
    const newNumberOfPages = Math.ceil(orders.length / orderPerPage);
    setPages(newNumberOfPages);
    setOrderData(
      orders.slice(
        orderPerPage * currentPage - orderPerPage,
        orderPerPage * currentPage,
      ),
    );
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  // const onUpdateItem = useCallback(
  //   async (
  //     orderTotalPrice: number,
  //     order: Order,
  //     updatedItem: OrderedItems,
  //     isConvertToCustom: boolean = false,
  //     itemId = null,
  //   ) => {
  //     try {
  //       const response = await updateOrderedItems(
  //         orderTotalPrice,
  //         order,
  //         updatedItem,
  //         showNotification,
  //         isConvertToCustom,
  //         itemId,
  //       );

  //       // Optimistic update
  //       handleUpdateUISingleOrder(order, response.data.data);
  //       setSelectedOrderDetails(response.data.updatedOrder);

  //       // Mutate to update real data
  //       mutate();

  //       showNotification('success', 'Update Item Successfully');
  //     } catch (error: any) {
  //       console.log('Fail to update order items: ', error);
  //       showNotification(
  //         'error',
  //         'Fail to update order items: ' + error.response.data.error,
  //       );
  //     }
  //   },
  //   [],
  // );

  const handleDeleteSelectedOrders = async () => {
    setIsExecutingAction(true);
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, '/clients/orders'),
        {
          data: { orderList: selectedOrders },
        },
      );

      showNotification('success', response.data.message);
      setSelectedOrders([]);
      mutate();

      setIsExecutingAction(false);
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);

      setIsExecutingAction(false);
      showNotification(
        'error',
        'Fail to mark all as completed: ' + error.response.data.error,
      );
    }
  };

  // const handleUpdateUISingleOrder = (targetOrder: Order, targetItem: Item) => {
  //   const newOrderData: Order[] = baseOrderData.map((order: Order) => {
  //     // If order is at targetOrder, then update
  //     if (order.id === targetOrder.id) {
  //       // update total price of the order
  //       let orderTotalPrice = 0;

  //       const newItems = order.items.map((item: Item) => {
  //         if (item.id === targetItem.id) {
  //           const totalPrice = targetItem.quantity * targetItem.price;
  //           orderTotalPrice += totalPrice;
  //           return { ...targetItem, totalPrice };
  //         }
  //         orderTotalPrice += item.totalPrice;
  //         return item;
  //       });
  //       return { ...order, items: newItems, totalPrice: orderTotalPrice };
  //     }
  //     return order;
  //   });

  //   setBaseOrderData(newOrderData);
  // };

  const handleUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
    setIsExecutingAction(true);
    try {
      await updateStatus(companyId, status, selectedOrders, showNotification);
      mutate();

      setIsExecutingAction(false);
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
      showNotification(
        'error',
        'Something went wrong: ' + error.response.data.error,
      );
    }
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

  // const handleUpdateStatusUI = (targetOrder: Order): void => {
  //   let newOrders = [];
  //   if (tabIndex !== 0 && targetOrder.status !== currentStatus) {
  //     newOrders = baseOrderData.filter((order) => order.id !== targetOrder.id);
  //   } else {
  //     newOrders = baseOrderData.map((order) => {
  //       if (order.id === targetOrder.id) {
  //         return targetOrder;
  //       }
  //       return order;
  //     });
  //   }
  //   setBaseOrderData(newOrders);
  // };

  const handlePrintAll = useReactToPrint({
    content: () => componentRef.current,
  });

  const filterByPaymentType = (orderList: Order[], type: PAYMENT_TYPE[]) => {
    setFilterOptions(type);
    if (!orderList || orderList.length === 0 || type.length === 0) {
      generateOrderData();
      return baseOrderData;
    }

    const newOrders = orderList.filter((order: Order) => {
      console.log(order, 'preference is undefined');
      return type.includes(order.user?.preference?.paymentType);
    });

    return newOrders;
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
          <DropdownItemContainer display="flex" gap={2}>
            <LocalPrintshopIcon sx={{ color: infoColor }} />
            <Typography>Print</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteSelectedOrders();
            handleCloseAnchor();
          }}
          disabled={orderData.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <DeleteIcon sx={{ color: errorColor }} />
            <Typography>Delete</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.INCOMPLETED);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.INCOMPLETED}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Mark as unfulfilled</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.DELIVERED);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.DELIVERED}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Mark as fulfilled</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.COMPLETED);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.COMPLETED}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Mark as paid</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.VOID);
            handleCloseAnchor();
          }}
          disabled={currentStatus === ORDER_STATUS.VOID}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <BlockIcon sx={{ color: errorColor }} />
            <Typography>Mark as void</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  const uppperContent = (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" color={blueGrey[800]}>
          Orders
        </Typography>
        {SelectDate}
      </Box>
      <OrderOverview
        // baseOrderData={baseOrderData}
        allRouteOrderData={orders ? orders.data : []}
        lastWeekOrderData={lastWeekOrders ? lastWeekOrders.data : []}
        currentDate={date}
        orderData={currentRoute === 0 ? baseOrderData : routeOrders}
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        routes={routes?.data || []}
        showNotification={showNotification}
      />
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={12} md={10.5}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              aria-label="basic tabs"
              value={tabIndex}
              onChange={(e, newValue) => setTabIndex(newValue)}
              variant={mdDown ? 'scrollable' : 'fullWidth'}
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
                        tabIndex === index
                          ? `(${currentRoute === 0 ? baseOrderData.length : routeOrders.length})`
                          : ''
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
            {/* <Fab
              size="medium"
              sx={{ backgroundColor: 'white' }}
              onClick={() => setIsSearchModalOpen(true)}
            >
              <SearchIcon />
            </Fab> */}
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
          <Box display="flex" gap={1}>
            {actionDropdown}
            <Box gap={2}>
              <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
                <TuneIcon />
              </IconButton>

              <Menu
                id="filter-menu"
                anchorEl={filterAnchor}
                open={openFilter}
                onClose={() => setFilterAnchor(null)}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem
                  style={{
                    backgroundColor:
                      filterOptions.length === 0 ? grey[200] : '#ffffff',
                  }}
                  onClick={() => setFilterOptions([])}
                >
                  <Typography>All</Typography>
                </MenuItem>
                <MenuItem
                  style={{
                    backgroundColor:
                      filterOptions.length === 1 &&
                      filterOptions[0] === PAYMENT_TYPE.COD
                        ? grey[200]
                        : '#ffffff',
                  }}
                  onClick={() => setFilterOptions([PAYMENT_TYPE.COD])}
                >
                  <Typography>COD</Typography>
                </MenuItem>
                <MenuItem
                  style={{
                    backgroundColor:
                      filterOptions.length === 1 && filterOptions[0] === wcodDay
                        ? grey[200]
                        : '#ffffff',
                  }}
                  onClick={() => setFilterOptions([wcodDay])}
                >
                  <Typography>{wcodDay}</Typography>
                </MenuItem>
                <MenuItem
                  style={{
                    backgroundColor:
                      filterOptions.length === 2 ? grey[200] : '#ffffff',
                  }}
                  onClick={() => setFilterOptions([PAYMENT_TYPE.COD, wcodDay])}
                >
                  <Typography>COD + {wcodDay}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Sidebar>
      <LoadingModal open={isExecutingAction} />
      {NotificationComp}
      <div style={{ display: 'none' }}>
        <MemoizedAllPrint
          orders={selectedOrders.length > 0 ? selectedOrders : orderData}
          ref={componentRef}
        />
      </div>
      <AddOrder
        open={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        clientList={clients?.data || []}
        showNotification={showNotification}
        currentDate={date}
        // createOrder={addOrder}
      />
      {selectedOrderDetails && (
        <OrderDetails
          open={!!selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          order={selectedOrderDetails}
          // handleUpdateItem={onUpdateItem}
          showNotification={showNotification}
        />
      )}
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
                      showNotification={showNotification}
                      selectedOrders={selectedOrders}
                      handleSelectOrder={handleSelectOrder}
                      handleOpenDetails={() => setSelectedOrderDetails(order)}
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
