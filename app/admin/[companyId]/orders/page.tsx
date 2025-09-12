'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  ListSubheader,
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
import { IItem, IOrderTimeline, IRoutes } from '@/app/utils/type';
import {
  generateRecommendDate,
  getWCODDay,
  YYYYMMDDFormat,
} from '@/app/utils/time';
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
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import DeleteModal from '../components/Modals/delete/DeleteModal';
import { PaymentStatus } from '@prisma/client';
import { MoneyOffOutlined } from '@mui/icons-material';

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
  shippingFee?: number;
  hasSubtractInventory?: boolean;
  paymentStatus?: PaymentStatus;
  timeline?: IOrderTimeline;
  delivery?: any;
  startTripAt?: string;
  enteredOrderAt?: string;
  isCODCheck?: boolean;
}

const ORDER_PER_PAGE = 10;

const useOrdersData = (
  companyId: string,
  date: string,
  currentStatus: ORDER_STATUS | PaymentStatus,
) => {
  const [orders, mutate, isValidating] = SWRFetchData(
    getAdminApiUrl(companyId, `/orders?date=${date}&status=${currentStatus}`),
  );

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

  return {
    orders,
    mutate,
    isValidating,
    routes,
    lastWeekOrders,
    clients,
  };
};

const useOrdersState = () => {
  const [baseOrderData, setBaseOrderData] = useState<Order[]>([]);
  const [currentRoute, setCurrentRoute] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentStatus, setCurrentStatus] = useState<
    ORDER_STATUS | PaymentStatus
  >(ORDER_STATUS.NONE);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [routeOrders, setRouteOrders] = useState<Order[]>([]);
  const [pages, setPages] = useState<number>(0);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<Order | null>(null);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<PAYMENT_TYPE[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);

  return {
    baseOrderData,
    setBaseOrderData,
    currentRoute,
    setCurrentRoute,
    currentPage,
    setCurrentPage,
    currentStatus,
    setCurrentStatus,
    orderData,
    setOrderData,
    routeOrders,
    setRouteOrders,
    pages,
    setPages,
    selectedOrders,
    setSelectedOrders,
    selectedOrderDetails,
    setSelectedOrderDetails,
    tabIndex,
    setTabIndex,
    searchKeywords,
    setSearchKeywords,
    filterOptions,
    setFilterOptions,
    isLoading,
    setIsLoading,
    isExecutingAction,
    setIsExecutingAction,
    incomingOrder,
    setIncomingOrder,
  };
};

const useModalState = () => {
  const [isAddOrderOpen, setIsAddOrderOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  return {
    isAddOrderOpen,
    setIsAddOrderOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
  };
};

const useMenuState = () => {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const openDropdown = Boolean(actionButtonAnchor);
  const openFilter = Boolean(filterAnchor);

  return {
    actionButtonAnchor,
    setActionButtonAnchor,
    filterAnchor,
    setFilterAnchor,
    openDropdown,
    openFilter,
  };
};

const filterOrderByRoute = (
  orders: Order[],
  routes: any,
  currentRoute: number,
  baseOrderData: Order[],
  setRouteOrders: (orders: Order[]) => void,
) => {
  if (!routes || !orders || orders.length === 0) {
    return [];
  }

  if (currentRoute === 0) {
    return baseOrderData;
  }

  const targetRoute = routes.data.find(
    (route: IRoutes) => route.id === currentRoute,
  );

  const filteredOrders: any = filterByRoute(orders, targetRoute);
  setRouteOrders(filteredOrders);
  return filteredOrders;
};

const filterByPaymentType = (orderList: Order[], type: PAYMENT_TYPE[]) => {
  if (!orderList || orderList.length === 0 || type.length === 0) {
    return orderList;
  }

  return orderList.filter((order: Order) => {
    return type.includes(order.user?.preference?.paymentType);
  });
};

export default function Orders() {
  const { companyId }: any = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramsDate = searchParams?.get('date');
  const paramsStatus = searchParams?.get('status');
  const paramsKeywords = searchParams?.get('q');

  const { date, setDate, SelectDate } = useSelectDate();
  const { showNotification, NotificationComp } = useNotification();
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const ordersState = useOrdersState();
  const modalState = useModalState();
  const menuState = useMenuState();

  const debouncedKeywords = useDebounce(ordersState.searchKeywords, 500);

  const { orders, mutate, isValidating, routes, lastWeekOrders, clients } =
    useOrdersData(companyId, date, ordersState.currentStatus);

  const componentRef = useRef<any>();
  const totalPosition = useRef<any>();

  const wcodDay = useMemo(() => {
    return getWCODDay(date) as PAYMENT_TYPE;
  }, [date]);

  const virtuosoHeight = useMemo(() => {
    if (totalPosition.current) {
      const currentOffSetHeight = window.innerHeight;
      return (
        currentOffSetHeight -
        totalPosition.current?.getBoundingClientRect().bottom
      );
    }
    return getWindowDimensions().height - 250;
  }, [totalPosition.current]);

  useEffect(() => {
    ordersState.setIsLoading(true);
  }, []);

  // Single effect to handle all URL parameter synchronization
  // useEffect(() => {
  // 	// Only update URL if we're not in the middle of a URL change
  // 	const currentUrl = window.location.search;
  // 	const urlParams = new URLSearchParams(currentUrl);

  // 	let hasChanges = false;

  // 	// Check if date needs to be updated in URL
  // 	if (date && urlParams.get('date') !== date) {
  // 		urlParams.set('date', date);
  // 		hasChanges = true;
  // 	}

  // 	// Check if status needs to be updated in URL
  // 	const currentStatus = statusTabs[ordersState.tabIndex].value;
  // 	if (urlParams.get('status') !== currentStatus) {
  // 		urlParams.set('status', currentStatus);
  // 		hasChanges = true;
  // 	}

  // 	// Check if search keywords need to be updated in URL
  // 	if (debouncedKeywords && urlParams.get('q') !== debouncedKeywords) {
  // 		urlParams.set('q', debouncedKeywords);
  // 		hasChanges = true;
  // 	} else if (!debouncedKeywords && urlParams.get('q')) {
  // 		urlParams.delete('q');
  // 		hasChanges = true;
  // 	}

  // 	// Only push to router if there are actual changes
  // 	if (hasChanges) {
  // 		const search = urlParams.toString();
  // 		const queryTerm = search ? `?${search}` : '';
  // 		router.push(`/admin/${companyId}/orders${queryTerm}`, { scroll: false });
  // 	}
  // }, [date, ordersState.tabIndex, debouncedKeywords, router, companyId]);

  // Handle URL parameter changes -> update local state
  // useEffect(() => {
  // 	if (queryDate && queryDate !== date) {
  // 		setDate(queryDate);
  // 	}

  // 	if (queryStatus) {
  // 		ordersState.setCurrentStatus(queryStatus as ORDER_STATUS | PaymentStatus);
  // 	}
  // }, [queryDate, queryStatus]);

  useEffect(() => {
    if (paramsDate) {
      setDate(YYYYMMDDFormat(new Date(paramsDate)));
    } else {
      setDate(generateRecommendDate());
    }
  }, [paramsDate]);

  useEffect(() => {
    if (paramsStatus) {
      ordersState.setCurrentStatus(
        paramsStatus as ORDER_STATUS | PaymentStatus,
      );
    } else {
      ordersState.setCurrentStatus(ORDER_STATUS.NONE);
    }
  }, [paramsStatus]);

  useEffect(() => {
    if (paramsKeywords) {
      ordersState.setSearchKeywords(paramsKeywords);
    } else {
      ordersState.setSearchKeywords('');
    }
  }, [paramsKeywords]);

  // useEffect(() => {
  // 	if (debouncedKeywords) {
  // 		ordersState.setSearchKeywords(debouncedKeywords);
  // 	} else {
  // 		ordersState.setSearchKeywords('');
  // 	}
  // }, [debouncedKeywords]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedKeywords) {
      params.set('q', debouncedKeywords);
    } else {
      params.delete('q');
    }

    router.replace(`/admin/${companyId}/orders?${params.toString()}`, {
      scroll: false,
    });
  }, [debouncedKeywords]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (date) {
      params.set('date', date);
    } else {
      params.delete('date');
    }

    router.replace(`/admin/${companyId}/orders?${params.toString()}`, {
      scroll: false,
    });
  }, [date]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (paramsStatus) {
      params.set('status', ordersState.currentStatus);
    } else {
      params.delete('status');
    }

    router.replace(`/admin/${companyId}/orders?${params.toString()}`, {
      scroll: false,
    });
  }, [ordersState.currentStatus]);

  useEffect(() => {
    ordersState.setCurrentRoute(0);
  }, [date]);

  useEffect(() => {
    if (orders && !isValidating) {
      ordersState.setIsLoading(false);
    } else if (!orders && isValidating) {
      ordersState.setIsLoading(true);
    }
  }, [isValidating, date, ordersState.currentStatus, ordersState.currentRoute]);

  useEffect(() => {
    if (orders) {
      initializeOrder();
    }
  }, [orders, date, ordersState.currentStatus]);

  useEffect(() => {
    ordersState.setSelectedOrders([]);
  }, [date, ordersState.currentStatus]);

  useEffect(() => {
    if (ordersState.baseOrderData.length > 0) {
      generateOrderData();
    } else {
      ordersState.setOrderData([]);
    }
  }, [ordersState.baseOrderData]);

  useEffect(() => {
    pusherClient?.subscribe(`admin-${companyId}`);
    pusherClient?.subscribe(`override-order-${companyId}`);
    pusherClient?.subscribe(`void-order-${companyId}`);

    pusherClient?.bind('incoming-order', (order: Order) => {
      ordersState.setIncomingOrder(order);
      mutate();
    });

    return () => {
      pusherClient?.unsubscribe(`admin-${companyId}`);
      pusherClient?.unsubscribe(`override-order-${companyId}`);
      pusherClient?.unsubscribe(`void-order-${companyId}`);
    };
  }, [date]);

  // useEffect(() => {
  // 	if (queryKeywords) {
  // 		ordersState.setSearchKeywords(queryKeywords);
  // 	}
  // }, [queryKeywords]);

  useEffect(() => {
    if (debouncedKeywords) {
      let baseOrders = ordersState.baseOrderData;

      if (ordersState.currentRoute > 0) {
        baseOrders = filterOrderByRoute(
          ordersState.baseOrderData,
          routes,
          ordersState.currentRoute,
          ordersState.baseOrderData,
          ordersState.setRouteOrders,
        );
      }

      const newOrderList = baseOrders.filter((order: Order) => {
        const searchTerm = debouncedKeywords?.toLowerCase() || '';
        return (
          order?.user?.clientId.includes(searchTerm) ||
          searchTerm === order.id.toString() ||
          order?.user?.clientName
            .toLowerCase()
            .includes(searchTerm) ||
          order?.orderRoute?.toLowerCase().includes(searchTerm)
        );
      });

      ordersState.setOrderData(newOrderList);
      ordersState.setPages(1);
    } else {
      generateOrderData();
    }
  }, [debouncedKeywords, ordersState.baseOrderData, ordersState.currentRoute]);

  useEffect(() => {
    generateOrderData();
  }, [
    ordersState.currentRoute,
    ordersState.currentPage,
    ordersState.filterOptions,
  ]);

  useEffect(() => {
    if (ordersState.incomingOrder) {
      if (
        ordersState.incomingOrder.deliveryDate === date &&
        (ordersState.incomingOrder.status === ordersState.currentStatus ||
          ordersState.tabIndex === 0) &&
        !ordersState.incomingOrder.isReplacement
      ) {
        ordersState.setBaseOrderData((prevOrders) => [
          ordersState.incomingOrder!,
          ...prevOrders,
        ]);
      } else if (
        ordersState.incomingOrder.isReplacement ||
        ordersState.incomingOrder.isVoid
      ) {
        const newOrderData = ordersState.baseOrderData.filter(
          (order: Order) => {
            return order.id !== ordersState.incomingOrder!.id;
          },
        );
        ordersState.setBaseOrderData([
          ordersState.incomingOrder!,
          ...newOrderData,
        ]);
      }
      ordersState.setIncomingOrder(null);
    }
  }, [ordersState.incomingOrder]);

  const initializeOrder = useCallback(() => {
    ordersState.setPages(Math.ceil(orders.data / ORDER_PER_PAGE));
    ordersState.setBaseOrderData([...(orders?.data || [])]);
    ordersState.setCurrentPage(1);

    if (ordersState.selectedOrderDetails) {
      const updatedOrderDetails = orders.data.find(
        (order: Order) => order.id === ordersState.selectedOrderDetails!.id,
      );

      if (updatedOrderDetails) {
        ordersState.setSelectedOrderDetails(updatedOrderDetails);
      }
    }
  }, [orders, ordersState.selectedOrderDetails]);

  const generateOrderData = useCallback(
    (orderList = ordersState.baseOrderData) => {
      if (!orderList || orderList.length === 0) {
        ordersState.setOrderData([]);
        return;
      }

      let orders = [...orderList];
      if (ordersState.currentRoute > 0) {
        orders = filterOrderByRoute(
          orders,
          routes,
          ordersState.currentRoute,
          ordersState.baseOrderData,
          ordersState.setRouteOrders,
        );
      }

      if (ordersState.filterOptions.length > 0) {
        orders = filterByPaymentType(orders, ordersState.filterOptions);
      }

      const newNumberOfPages = Math.ceil(orders.length / ORDER_PER_PAGE);
      ordersState.setPages(newNumberOfPages);
      ordersState.setOrderData(
        orders.slice(
          ORDER_PER_PAGE * ordersState.currentPage - ORDER_PER_PAGE,
          ORDER_PER_PAGE * ordersState.currentPage,
        ),
      );
    },
    [
      ordersState.baseOrderData,
      ordersState.currentRoute,
      ordersState.filterOptions,
      ordersState.currentPage,
      routes,
    ],
  );

  const handleCloseAnchor = useCallback(() => {
    menuState.setActionButtonAnchor(null);
  }, []);

  const handleDeleteSelectedOrders = useCallback(async () => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, '/clients/orders'),
        {
          data: { orderList: ordersState.selectedOrders },
        },
      );

      showNotification('success', response.data.message);
      ordersState.setSelectedOrders([]);
      mutate();
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
      showNotification(
        'error',
        'Something went wrong: ' + error.response.data.error,
      );
    }
  }, [companyId, ordersState.selectedOrders, showNotification, mutate]);

  const handleUpdateStatus = useCallback(
    async (
      status: ORDER_STATUS | PaymentStatus,
      type: 'fulfill' | 'payment' = 'fulfill',
    ): Promise<void> => {
      ordersState.setIsExecutingAction(true);
      try {
        await updateStatus(
          companyId,
          status,
          ordersState.selectedOrders,
          showNotification,
          type,
        );
        mutate();
        ordersState.setIsExecutingAction(false);
      } catch (error: any) {
        console.log('Fail to mark all as completed: ', error);
        showNotification(
          'error',
          'Something went wrong: ' + error.response.data.error,
        );
      }
    },
    [companyId, ordersState.selectedOrders, showNotification, mutate],
  );

  const handleSelectOrder = useCallback(
    (e: any, targetOrder: Order) => {
      e.stopPropagation();
      e.preventDefault();
      const selectedOrder = ordersState.selectedOrders.find((order: Order) => {
        return order.id === targetOrder.id;
      });

      if (selectedOrder) {
        const newSelectedOrders = ordersState.selectedOrders.filter(
          (order: Order) => {
            return order.id !== targetOrder.id;
          },
        );
        ordersState.setSelectedOrders(newSelectedOrders);
      } else {
        ordersState.setSelectedOrders([
          ...ordersState.selectedOrders,
          targetOrder,
        ]);
      }
    },
    [ordersState.selectedOrders],
  );

  const handleSelectAll = useCallback(
    (e: any) => {
      e.preventDefault();
      if (ordersState.selectedOrders.length === ordersState.orderData.length) {
        ordersState.setSelectedOrders([]);
      } else {
        ordersState.setSelectedOrders(ordersState.orderData);
      }
    },
    [ordersState.selectedOrders.length, ordersState.orderData],
  );

  const handlePrintAll = useReactToPrint({
    content: () => componentRef.current,
  });

  const renderActionDropdown = () => (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <Button
        aria-controls={menuState.openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuState.openDropdown ? 'true' : undefined}
        onClick={(e) => menuState.setActionButtonAnchor(e.currentTarget)}
        endIcon={<ArrowDownwardIcon />}
        variant="outlined"
        disabled={ordersState.selectedOrders.length === 0}
      >
        Actions
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={menuState.actionButtonAnchor}
        open={menuState.openDropdown}
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
          disabled={ordersState.orderData.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalPrintshopIcon sx={{ color: infoColor }} />
            <Typography>Print</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            modalState.setIsDeleteModalOpen(true);
            handleCloseAnchor();
          }}
          disabled={ordersState.orderData.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <DeleteIcon sx={{ color: errorColor }} />
            <Typography>Delete</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <Divider />
        <ListSubheader>Fulfillment Status</ListSubheader>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.INCOMPLETED);
            handleCloseAnchor();
          }}
          disabled={ordersState.currentStatus === ORDER_STATUS.INCOMPLETED}
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
          disabled={ordersState.currentStatus === ORDER_STATUS.DELIVERED}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Mark as fulfilled</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.VOID);
            handleCloseAnchor();
          }}
          disabled={ordersState.currentStatus === ORDER_STATUS.VOID}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <BlockIcon sx={{ color: errorColor }} />
            <Typography>Mark as void</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <Divider />
        <ListSubheader>Payment Status</ListSubheader>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(PaymentStatus.Paid, 'payment');
            handleCloseAnchor();
          }}
          disabled={ordersState.currentStatus === PaymentStatus.Paid}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Mark as paid</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(PaymentStatus.Unpaid, 'payment');
            handleCloseAnchor();
          }}
          disabled={ordersState.currentStatus === PaymentStatus.Unpaid}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <MoneyOffOutlined sx={{ color: errorColor }} />
            <Typography>Mark as unpaid</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  const renderUpperContent = () => (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" color={blueGrey[800]}>
          Orders
        </Typography>
        {SelectDate}
      </Box>
      <OrderOverview
        allRouteOrderData={orders ? orders.data : []}
        lastWeekOrderData={lastWeekOrders ? lastWeekOrders.data : []}
        currentDate={date}
        orderData={
          ordersState.currentRoute === 0
            ? ordersState.baseOrderData
            : ordersState.routeOrders
        }
        currentRoute={ordersState.currentRoute}
        setCurrentRoute={ordersState.setCurrentRoute}
        routes={routes?.data || []}
        showNotification={showNotification}
      />
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={12} md={10.5}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              aria-label="basic tabs"
              value={ordersState.currentStatus.toString()}
              onChange={(e, newValue) => ordersState.setCurrentStatus(newValue)}
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
                        ordersState.currentStatus === statusTab.name ||
                        (ordersState.currentStatus === 'none' &&
                          statusTab.name === 'All')
                          ? `(${ordersState.currentRoute === 0 ? ordersState.baseOrderData.length : ordersState.routeOrders.length})`
                          : ''
                      } `}
                      aria-controls={`tabpanel-${index}`}
                      value={statusTab.name === 'All' ? 'none' : statusTab.name}
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
              color="primary"
              onClick={() => modalState.setIsAddOrderOpen(true)}
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
            value={ordersState.searchKeywords}
            onChange={(e) => ordersState.setSearchKeywords(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  ordersState.orderData.length ===
                  ordersState.selectedOrders.length
                }
                onClick={handleSelectAll}
              />
            }
            label="Select All"
          />
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Box display="flex" gap={1}>
            {renderActionDropdown()}
            <Box gap={2}>
              <IconButton
                onClick={(e) => menuState.setFilterAnchor(e.currentTarget)}
              >
                <TuneIcon />
              </IconButton>

              <Menu
                id="filter-menu"
                anchorEl={menuState.filterAnchor}
                open={menuState.openFilter}
                onClose={() => menuState.setFilterAnchor(null)}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem
                  style={{
                    backgroundColor:
                      ordersState.filterOptions.length === 0
                        ? grey[200]
                        : '#ffffff',
                  }}
                  onClick={() => ordersState.setFilterOptions([])}
                >
                  <Typography>All</Typography>
                </MenuItem>
                <MenuItem
                  style={{
                    backgroundColor:
                      ordersState.filterOptions.length === 1 &&
                      ordersState.filterOptions[0] === PAYMENT_TYPE.COD
                        ? grey[200]
                        : '#ffffff',
                  }}
                  onClick={() =>
                    ordersState.setFilterOptions([PAYMENT_TYPE.COD])
                  }
                >
                  <Typography>COD</Typography>
                </MenuItem>
                <MenuItem
                  style={{
                    backgroundColor:
                      ordersState.filterOptions.length === 1 &&
                      ordersState.filterOptions[0] === wcodDay
                        ? grey[200]
                        : '#ffffff',
                  }}
                  onClick={() => ordersState.setFilterOptions([wcodDay])}
                >
                  <Typography>{wcodDay}</Typography>
                </MenuItem>
                <MenuItem
                  style={{
                    backgroundColor:
                      ordersState.filterOptions.length === 2
                        ? grey[200]
                        : '#ffffff',
                  }}
                  onClick={() =>
                    ordersState.setFilterOptions([PAYMENT_TYPE.COD, wcodDay])
                  }
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

  const renderContent = () => {
    if (ordersState.isLoading) {
      return (
        <>
          {renderUpperContent()}
          <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
            <LoadingComponent />
          </div>
        </>
      );
    }

    return (
      <>
        {renderUpperContent()}
        {ordersState.orderData.length > 0 ? (
          <>
            <Virtuoso
              totalCount={ordersState.orderData.length}
              style={{ height: virtuosoHeight }}
              data={ordersState.orderData}
              itemContent={(index, order) => {
                return (
                  <OrderAccordion
                    key={index}
                    order={order}
                    showNotification={showNotification}
                    selectedOrders={ordersState.selectedOrders}
                    handleSelectOrder={handleSelectOrder}
                    handleOpenDetails={() =>
                      ordersState.setSelectedOrderDetails(order)
                    }
                    mutateOrders={mutate}
                  />
                );
              }}
            />
            <div style={{ width: '100%' }}>
              <Pagination
                count={ordersState.pages}
                shape="rounded"
                size="large"
                onChange={(e: any, value: number) =>
                  ordersState.setCurrentPage(value)
                }
              />
            </div>
          </>
        ) : (
          <ErrorComponent errorText="There is no orders" />
        )}
      </>
    );
  };

  return (
    <Sidebar>
      <LoadingModal open={ordersState.isExecutingAction} />
      {NotificationComp}
      <div style={{ display: 'none' }}>
        <MemoizedAllPrint
          orders={
            ordersState.selectedOrders.length > 0
              ? ordersState.selectedOrders
              : ordersState.orderData
          }
          ref={componentRef}
        />
      </div>
      <DeleteModal
        open={modalState.isDeleteModalOpen}
        handleCloseModal={() => modalState.setIsDeleteModalOpen(false)}
        targetObj={ordersState.selectedOrders}
        handleDelete={handleDeleteSelectedOrders}
      />
      <AddOrder
        open={modalState.isAddOrderOpen}
        onClose={() => modalState.setIsAddOrderOpen(false)}
        clientList={clients?.data || []}
        showNotification={showNotification}
        currentDate={date}
      />
      {ordersState.selectedOrderDetails && (
        <OrderDetails
          open={!!ordersState.selectedOrderDetails}
          onClose={() => ordersState.setSelectedOrderDetails(null)}
          order={ordersState.selectedOrderDetails}
          showNotification={showNotification}
        />
      )}
      {renderContent()}
    </Sidebar>
  );
}
