'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { SplashScreen } from '../../HOC/AuthenGuard';
import Sidebar from '../components/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import SelectDateRange from '../admin/components/Select/SelectDateRange';
import { generateMonthRange } from '../utils/time';
import { Order } from '../admin/orders/page';
import TuneIcon from '@mui/icons-material/Tune';
import { API_URL, ORDER_STATUS } from '../utils/enum';
import OrderAccordion from '../components/OrderAccordion';
import { Virtuoso } from 'react-virtuoso';
import useDebounce from '@/hooks/useDebounce';
import { DropdownItemContainer } from '../admin/orders/styled';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '../../theme/color';
import { blue } from '@mui/material/colors';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ErrorComponent from '../admin/components/ErrorComponent';
import { SWRFetchData } from '../utils/db';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import OverviewCard from '../admin/components/OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const totalYPosition = 250;
export default function HistoryPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [filterOptions, setFilterOptions] = useState<ORDER_STATUS | string>(
    'All',
  );
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [virtuosoHeight, setVirtuosoHeight] = useState<number>(0);
  const debouncedKeywords = useDebounce(searchKeywords, 800);
  // const totalPositionRef: any = useRef(null);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderData, _mutateOrders, isValidating] = SWRFetchData(
    `${API_URL.CLIENT_ORDER}?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  const unpaidTotal = useMemo(() => {
    const unpaidOrders = baseClientOrders.filter((order: Order) => {
      return order.status !== ORDER_STATUS.COMPLETED;
    });

    return unpaidOrders.reduce((total: number, order: Order) => {
      return total + order.totalPrice;
    }, 0);
  }, [baseClientOrders]);

  useEffect(() => {
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - totalYPosition);
  }, []);

  useEffect(() => {
    if (dateRange && orderData) {
      initializeOrders();
    }
  }, [dateRange, orderData]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderData = baseClientOrders.filter((order: Order) => {
        if (
          order.id.toString().includes(debouncedKeywords) ||
          order.status.toLowerCase() === debouncedKeywords.toLowerCase() ||
          order.deliveryDate.includes(debouncedKeywords)
        ) {
          return true;
        }
        return false;
      });
      setClientOrders(newOrderData);
    } else {
      setClientOrders(baseClientOrders);
    }
  }, [debouncedKeywords, baseClientOrders]);

  const filterOrder = (status: ORDER_STATUS) => {
    const newClientOrders = baseClientOrders.filter((order: Order) => {
      return order.status === status;
    });

    setFilterOptions(status);
    setClientOrders(newClientOrders);
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const initializeOrders = () => {
    const filteredOrders = filterDateRangeOrders(
      orderData.data.userOrders,
      dateRange[0],
      dateRange[1],
    );
    setClientOrders(filteredOrders);
    setBaseClientOrders(filteredOrders);
  };

  const resetOrders = () => {
    setClientOrders(baseClientOrders);
    setFilterOptions('All');
  };

  const filterDropdown = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <IconButton onClick={(e) => setActionButtonAnchor(e.currentTarget)}>
        <TuneIcon />
      </IconButton>
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
            resetOrders();
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === 'All'}
          >
            <ReceiptLongIcon sx={{ color: blue[700] }} />
            <Typography>All orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.COMPLETED);
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.COMPLETED}
          >
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Completed orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.DELIVERED);
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.DELIVERED}
          >
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Delivered orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.INCOMPLETED);
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.INCOMPLETED}
          >
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Incompleted orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.VOID);
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.VOID}
          >
            <ErrorIcon sx={{ color: errorColor }} />
            <Typography>Void orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Sidebar>
      <Grid
        container
        columnSpacing={2}
        alignItems="center"
        spacing={2}
        sx={{ position: 'sticky' }}
      >
        <Grid item xs={12} md={6}>
          <Typography variant="h4">History</Typography>
        </Grid>
        <Grid item xs={12} md={6} textAlign={!mdDown ? 'right' : 'left'}>
          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </Grid>
        <Grid item xs={12}>
          <OverviewCard
            text="Due Amount"
            value={unpaidTotal}
            icon={<AttachMoneyIcon sx={{fontSize: 50}} fontSize="large" color="primary" />}
          />
        </Grid>
        {/* <Grid item xs={6}>
          <OverviewCard
            text="Total Bill ($)"
            value={totalBill}
            // icon={<MonetizationOnIcon fontSize="large" color="primary" />}
          />
        </Grid> */}
        <Grid item xs={12}>
          <OverviewCard
            text="Total Orders"
            value={baseClientOrders.length}
            icon={<ReceiptLongIcon sx={{fontSize: 50}} fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={11}>
          <TextField
            fullWidth
            variant="filled"
            placeholder="Search by invoice id, date or status"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
          />
        </Grid>
        <Grid item xs={1} textAlign="right">
          {filterDropdown}
        </Grid>
        {/* <Grid item xs={12} ref={totalPositionRef}>
          <Box
            sx={{
              backgroundColor: blueGrey[800],
              color: 'white',
              width: 'fit-content',
              padding: 1,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6">
              Total: {clientOrders.length} orders
            </Typography>
          </Box>
        </Grid> */}
        <Grid item xs={12}>
          {isValidating && !clientOrders ? (
            <SplashScreen />
          ) : clientOrders.length > 0 ? (
            <Virtuoso
              totalCount={clientOrders.length}
              style={{ height: virtuosoHeight }}
              data={clientOrders}
              itemContent={(index: number, order: Order) => (
                <OrderAccordion key={index} order={order} />
              )}
            />
          ) : (
            <ErrorComponent errorText="No Order Found" />
          )}
        </Grid>
      </Grid>
    </Sidebar>
  );
}
