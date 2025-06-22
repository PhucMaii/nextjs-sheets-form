'use client';
import React, { useEffect, useState } from 'react';
import { SplashScreen } from '../../../HOC/AuthenGuard';
import Sidebar from '../../components/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import { generateMonthRange } from '@/app/utils/time';
import { Order } from '@/app/admin/[companyId]/orders/page';
import TuneIcon from '@mui/icons-material/Tune';
import { ORDER_STATUS } from '@/app/utils/enum';
import { Virtuoso } from 'react-virtuoso';
import useDebounce from '@/hooks/useDebounce';
import { DropdownItemContainer } from '@/app/admin/[companyId]/orders/styled';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '../../../theme/color';
import { blue } from '@mui/material/colors';
import { getWindowDimensions } from '@/hooks/useWindowDimensions';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ErrorComponent from '@/app/admin/[companyId]/components/ErrorComponent';
import { SWRFetchData } from '@/app/utils/db';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import OverviewCard from '@/app/admin/[companyId]/components/OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SelectDateRange from '@/app/admin/[companyId]/components/Select/SelectDateRange';
// import OrderAccordion from '@/app/admin/[companyId]/components/OrderAccordion';
import { PaymentStatus } from '@prisma/client';
import OrderAccordion from '@/app/components/OrderAccordion';

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
  const [tabIdx, setTabIdx] = useState<number>(0);
  const debouncedKeywords = useDebounce(searchKeywords, 800);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  // const monthRange = useMemo(() => {
  //   return generateMonthRange();
  // }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderData, _mutateOrders, isValidating] = SWRFetchData(
    `/api/order?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  // const currentMonthBill = useMemo(() => {
  //   return baseClientOrders.reduce((total: number, order: Order) => {
  //     return total + order.totalPrice;
  //   }, 0);
  // }, [baseClientOrders]);

  useEffect(() => {
    const windowDimensions = getWindowDimensions();
    setVirtuosoHeight(windowDimensions.height - totalYPosition);
  }, []);

  useEffect(() => {
    if (orderData) {
      initializeOrders();
    }
  }, [orderData, tabIdx]);

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

  const filterOrder = (status: ORDER_STATUS | PaymentStatus, type: 'fulfillment' | 'payment') => {
    const newClientOrders = baseClientOrders.filter((order: Order) => {
      if (type === 'fulfillment') {
        return order.status === status;
      } else {
        return order.paymentStatus === status;
      }
    });

    setFilterOptions(status);
    setClientOrders(newClientOrders);
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const initializeOrders = () => {
    const orders =
      tabIdx === 0 ? orderData.data.userOrders : orderData.data.dueOrders;
    const filteredOrders = filterDateRangeOrders(
      orders,
      dateRange[0],
      dateRange[1],
    );

    setClientOrders(tabIdx === 0 ? filteredOrders : orders);
    setBaseClientOrders(tabIdx === 0 ? filteredOrders : orders);
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
            filterOrder(PaymentStatus.Paid, 'payment');
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === PaymentStatus.Paid}
          >
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Paid orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.DELIVERED, 'fulfillment');
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.DELIVERED}
          >
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Fulfilled orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.INCOMPLETED, 'fulfillment');
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer
            display="flex"
            gap={2}
            isSelected={filterOptions === ORDER_STATUS.INCOMPLETED}
          >
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Unfulfilled orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrder(ORDER_STATUS.VOID, 'fulfillment');
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
            text="Over Due"
            value={orderData?.data?.dueAmount?.toFixed(2) || 0}
            icon={
              <AttachMoneyIcon
                sx={{ fontSize: 50 }}
                fontSize="large"
                color="primary"
              />
            }
          />
        </Grid>
        <Grid item xs={6}>
          <OverviewCard
            text="Current Month ($)"
            value={orderData?.data?.currentMonthBill?.toFixed(2) || 0}
            // icon={<MonetizationOnIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={6}>
          <OverviewCard
            text="Total Orders"
            value={baseClientOrders.length}
            // icon={<ReceiptLongIcon sx={{fontSize: 50}} fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12}>
          <Tabs
            value={tabIdx}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
            onChange={(e: any, value) => setTabIdx(value)}
          >
            <Tab value={0} label="Current Month" />
            <Tab value={1} label="Over Due" />
          </Tabs>
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
        <Grid item xs={12}>
          {isValidating && !clientOrders ? (
            <SplashScreen />
          ) : clientOrders.length > 0 ? (
            <Virtuoso
              totalCount={clientOrders.length}
              style={{ height: virtuosoHeight }}
              data={clientOrders}
              itemContent={(index: number, order: Order) => (
                // <OrderAccordion key={index} order={order} />
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
