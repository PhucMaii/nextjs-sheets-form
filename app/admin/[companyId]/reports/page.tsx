'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ShadowSection } from './styled';
import { UserType } from '@/app/utils/type';
import {
  ORDER_STATUS,
  PAYMENT_TYPE,
  getAdminApiUrl,
} from '@/app/utils/enum';
import { Order } from '../orders/page';
import SelectDateRange from '../components/Select/SelectDateRange';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingIcon from '@mui/icons-material/Pending';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { blue, blueGrey } from '@mui/material/colors';
import { generateMonthRange } from '@/app/utils/time';
import MoneyOffCsredIcon from '@mui/icons-material/MoneyOffCsred';
// import { pusherClient } from '@/app/pusher';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import { SWRFetchData } from '@/app/utils/db';
import useSelectDate from '@/hooks/useSelectDate';
import useNotification from '@/hooks/useNotification';
import { PriceChange } from '@mui/icons-material';
import OrderInReportPage from './OrderInReportPage';
import ChequeTab from './ChequeTab';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useDebounce from '@/hooks/useDebounce';
import { PaymentStatus } from '@prisma/client';
import ClientSearch from '../components/Autocomplete/ClientSearch';

// Types
interface ReportStats {
  bill: number;
  profit: number;
}

// Constants
const ALL_CLIENTS_OPTION = {
  clientId: '',
  clientName: 'All Clients',
  deliveryAddress: '',
} as UserType;

// Custom Hooks
const useReportData = (
  companyId: string,
  clientValue: UserType | null,
  dateRange: any,
  datePicker?: string,
) => {
  const [orders, mutateOrders] = SWRFetchData(
    !clientValue
      ? ''
      : clientValue?.clientName === 'All Clients'
        ? getAdminApiUrl(
            companyId,
            `/clients/orders?deliveryDate=${datePicker || ''}`,
          )
        : getAdminApiUrl(
            companyId,
            `/clients/orders?userId=${clientValue?.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
          ),
  );

  const [clients] = SWRFetchData(getAdminApiUrl(companyId, '/clients'));

  return {
    orders,
    mutateOrders,
    clients,
  };
};

const useReportState = () => {
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientValue, setClientValue] = useState<UserType | any>({
    clientId: '',
    clientName: 'All Clients',
  });
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  return {
    baseClientOrders,
    setBaseClientOrders,
    clientValue,
    setClientValue,
    clientOrders,
    setClientOrders,
    dateRange,
    setDateRange,
    unpaidOrders,
    setUnpaidOrders,
    isFetching,
    setIsFetching,
    selectedOrders,
    setSelectedOrders,
    tabIndex,
    setTabIndex,
    searchKeywords,
    setSearchKeywords,
  };
};

// Utility Functions
const calculateTotalBill = (orders: Order[]): ReportStats => {
  if (!orders || orders.length === 0) {
    return { bill: 0, profit: 0 };
  }

  return orders.reduce(
    (acc: ReportStats, order: Order) => {
      if (order.status === ORDER_STATUS.VOID) {
        return acc;
      }

      acc.bill += order.totalPrice;
      acc.profit += order?.profit || 0;

      return acc;
    },
    { bill: 0, profit: 0 },
  );
};

const calculateUnpaidBill = (orders: Order[]): number => {
  const unpaidOrders = orders.filter((order: Order) => {
    return (
      order.paymentStatus === PaymentStatus.Unpaid &&
      order.status !== ORDER_STATUS.VOID
    );
  });

  return unpaidOrders.reduce((acc: number, order: Order) => {
    return acc + order.totalPrice;
  }, 0);
};

// Main Component
export default function ReportPage() {
  const { companyId }: any = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();
  const { date: datePicker, setDate, SelectDate } = useSelectDate();
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  // Get URL parameters
  const queryClientId = searchParams?.get('clientId');
  const querySearchKeywords = searchParams?.get('q');
  const queryDate = searchParams?.get('date');
  const startDate = searchParams?.get('startDate');
  const endDate = searchParams?.get('endDate');

  // State management
  const reportState = useReportState();
  const debouncedSearchKeywords = useDebounce(reportState.searchKeywords, 500);

  // Data fetching
  const { orders, mutateOrders, clients } = useReportData(
    companyId,
    reportState.clientValue,
    reportState.dateRange,
    datePicker,
  );

  // Computed values
  const totalBill = useMemo(() => {
    return calculateTotalBill(reportState.clientOrders);
  }, [reportState.clientOrders]);

  const unpaidBill = useMemo(() => {
    return calculateUnpaidBill(reportState.clientOrders);
  }, [reportState.clientOrders]);

  const clientOptions = useMemo(() => {
    return [ALL_CLIENTS_OPTION, ...(clients?.data || [])] as UserType[];
  }, [clients?.data]);

  const isChequeTabDisabled = useMemo(() => {
    return (
      reportState.clientValue?.clientName === 'All Clients' ||
      reportState.clientValue?.preference?.paymentType !== PAYMENT_TYPE.MONTHLY
    );
  }, [reportState.clientValue]);

  useEffect(() => {
    if (queryClientId) {
      reportState.setClientValue(
        queryClientId === 'All Clients'
          ? ALL_CLIENTS_OPTION
          : clientOptions.find((option) => option.clientId === queryClientId) ||
              null,
      );
    }
  }, [queryClientId, clientOptions]);

  // Single effect to handle all URL parameter synchronization
  useEffect(() => {
    const currentUrl = window.location.search;
    const urlParams = new URLSearchParams(currentUrl);

    let hasChanges = false;

    // Check if clientId needs to be updated in URL
    const currentClientId =
      reportState.clientValue?.clientName === 'All Clients'
        ? 'All Clients'
        : reportState.clientValue?.clientId || '';
    if (urlParams.get('clientId') !== currentClientId) {
      if (currentClientId) {
        urlParams.set('clientId', currentClientId);
      } else {
        urlParams.delete('clientId');
      }
      hasChanges = true;
    }

    // Only push to router if there are actual changes
    if (hasChanges) {
      const search = urlParams.toString();
      const queryTerm = search ? `?${search}` : '';
      router.replace(`/admin/${companyId}/reports${queryTerm}`, {
        scroll: false,
      });
    }
  }, [reportState.clientValue]);

  useEffect(() => {
    // Check if search keywords need to be updated in URL
    let hasChanges = false;
    const currentUrl = window.location.search;
    const urlParams = new URLSearchParams(currentUrl);

    console.log(urlParams.get('q'), debouncedSearchKeywords);

    if (debouncedSearchKeywords) {
      const newOrderData = reportState.baseClientOrders.filter(
        (order: Order) => {
          if (
            order.id.toString().includes(debouncedSearchKeywords) ||
            order.user.clientId === debouncedSearchKeywords ||
            order.user.clientName
              .toLowerCase()
              .includes(debouncedSearchKeywords.toLowerCase()) ||
            order.status.toLowerCase() === debouncedSearchKeywords.toLowerCase()
          ) {
            return true;
          }
          return false;
        },
      );

      reportState.setClientOrders(newOrderData);

      if (urlParams.get('q') !== debouncedSearchKeywords) {
        urlParams.set('q', debouncedSearchKeywords);
        hasChanges = true;
      }
    } else {
      reportState.setClientOrders(reportState.baseClientOrders);

      if (urlParams.get('q')) {
        urlParams.delete('q');
        hasChanges = true;
      }
    }

    if (hasChanges) {
      const search = urlParams.toString();
      const queryTerm = search ? `?${search}` : '';
      router.replace(`/admin/${companyId}/reports${queryTerm}`, {
        scroll: false,
      });
    }
  }, [debouncedSearchKeywords]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (datePicker) {
      params.set('date', datePicker);
    } else {
      params.delete('date');
    }

    router.replace(`/admin/${companyId}/reports?${params.toString()}`, {
      scroll: false,
    });
  }, [datePicker]);

  // Effects
  useEffect(() => {
    if (reportState.clientOrders.length === 0) {
      reportState.setSelectedOrders([]);
    }
  }, [reportState.clientOrders]);

  useEffect(() => {
    if (
      orders &&
      reportState.clientValue &&
      (reportState.dateRange.length > 0 || datePicker)
    ) {
      initializeOrders();
    } else {
      reportState.setClientOrders([]);
      reportState.setBaseClientOrders([]);
    }
  }, [
    reportState.clientValue,
    reportState.dateRange,
    datePicker,
    orders?.data,
  ]);

  useEffect(() => {
    if (isChequeTabDisabled) {
      reportState.setTabIndex(0);
    }
  }, [reportState.clientValue, isChequeTabDisabled]);

  // Handle URL parameter changes -> update local state
  useEffect(() => {
    if (querySearchKeywords !== reportState.searchKeywords) {
      console.log('querySearchKeywords', querySearchKeywords);
      reportState.setSearchKeywords(querySearchKeywords || '');
    }
  }, [querySearchKeywords]);

  useEffect(() => {
    if (queryDate) {
      setDate(queryDate);
    }
  }, [queryDate]);

  useEffect(() => {
    if (startDate || endDate) {
      reportState.setDateRange([
        new Date(startDate || ''),
        new Date(endDate || ''),
      ]);
    } else {
      reportState.setDateRange(generateMonthRange());
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (reportState.dateRange[0] || reportState.dateRange.length > 0) {
      params.set('startDate', reportState.dateRange[0]);
      params.set('endDate', reportState.dateRange[1]);
    } else {
      params.delete('startDate');
      params.delete('endDate');
    }

    router.replace(`/admin/${companyId}/reports?${params.toString()}`, {
      scroll: false,
    });
  }, [reportState.dateRange]);

  // Event handlers
  const initializeOrders = useCallback(() => {
    let orderData = orders.data;

    if (reportState.clientValue?.clientName !== 'All Clients') {
      orderData = filterDateRangeOrders(
        orders.data,
        reportState.dateRange[0],
        reportState.dateRange[1],
      );
    }

    const newUnpaidOrders = orderData.filter((order: Order) => {
      return (
        order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.INCOMPLETED
      );
    });

    if (reportState.selectedOrders.length > 0) {
      const newSelectedOrders = reportState.selectedOrders
        .map((order: Order) => {
          return orders?.data.find((o: Order) => o.id === order.id);
        })
        .filter(Boolean) as Order[];

      reportState.setSelectedOrders(newSelectedOrders);
    }

    reportState.setUnpaidOrders(newUnpaidOrders);
    reportState.setClientOrders(orderData);
    reportState.setBaseClientOrders(orderData);
    reportState.setIsFetching(false);
  }, [
    orders?.data,
    reportState.clientValue,
    reportState.dateRange,
    reportState.selectedOrders,
  ]);

  const handleClientChange = useCallback(
    (event: any, newValue: UserType | null) => {
      reportState.setClientValue(newValue);
      reportState.setSearchKeywords(''); // Reset search when client changes
    },
    [],
  );

  const handleTabChange = useCallback((event: any, value: number) => {
    reportState.setTabIndex(value);
  }, []);

  // Render functions
  const renderHeader = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" color={blueGrey[800]}>
        Reports
      </Typography>
      {reportState.clientValue?.clientName === 'All Clients' ? (
        <>{SelectDate}</>
      ) : (
        <SelectDateRange
          dateRange={reportState.dateRange}
          setDateRange={reportState.setDateRange}
        />
      )}
    </Box>
  );

  const renderClientSelector = () => (
    <ShadowSection display="flex" flexDirection="column" gap={1}>
      <Typography variant="h6" color={blueGrey[800]} sx={{ mb: 1 }}>
        Clients
      </Typography>
      {/* <Autocomplete
        options={clientOptions}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => <TextField {...params} label="Client" />}
        renderOption={renderOption}
        value={reportState.clientValue}
        onChange={handleClientChange}
        sx={{ width: 'auto' }}
      /> */}
      <ClientSearch
        clients={clientOptions}
        value={reportState.clientValue}
        onChange={handleClientChange}
      />
    </ShadowSection>
  );

  const renderOverviewCards = () => (
    <Grid container spacing={3} mb={2}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <OverviewCard
          icon={<ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />}
          text="Total Orders"
          value={reportState.clientOrders.length}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <OverviewCard
          icon={<MonetizationOnIcon sx={{ fontSize: 50 }} color="primary" />}
          text="Total Bill"
          value={`$${totalBill.bill.toFixed(2)}`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <OverviewCard
          icon={<MonetizationOnIcon sx={{ fontSize: 50 }} color="primary" />}
          text="Unpaid Bill"
          value={`$${unpaidBill.toFixed(2)}`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <OverviewCard
          icon={<PriceChange sx={{ fontSize: 50 }} color="primary" />}
          text="Profit"
          value={`$${totalBill.profit > 0 ? totalBill.profit.toFixed(2) : 0}`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        {orders?.overDueOrders ? (
          <OverviewCard
            icon={<MoneyOffCsredIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Over Due"
            value={orders?.overDueAmount?.toFixed(2)}
          />
        ) : (
          <OverviewCard
            icon={<PendingIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Unpaid orders"
            value={reportState.unpaidOrders.length}
          />
        )}
      </Grid>
    </Grid>
  );

  const renderTabs = () => (
    <Tabs
      value={reportState.tabIndex}
      onChange={handleTabChange}
      variant={smDown ? 'fullWidth' : 'scrollable'}
      sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab label="Orders" value={0} />
      <Tab label="Cheques" value={1} disabled={isChequeTabDisabled} />
    </Tabs>
  );

  const renderTabContent = () => {
    if (reportState.tabIndex === 0) {
      return (
          <OrderInReportPage
            clientOrders={reportState.clientOrders}
            setClientOrders={reportState.setClientOrders}
            showNotification={showNotification}
            isFetching={reportState.isFetching}
            clientValue={reportState.clientValue}
            dateRange={reportState.dateRange}
            setUnpaidOrders={reportState.setUnpaidOrders}
            mutateOrders={mutateOrders}
            datePicker={datePicker}
            baseClientOrders={reportState.baseClientOrders}
            setBaseClientOrders={reportState.setBaseClientOrders}
            searchKeywords={reportState.searchKeywords}
            setSearchKeywords={reportState.setSearchKeywords}
          />
      );
    }

    return (
      <ChequeTab
        client={reportState.clientValue}
        showNotification={showNotification}
      />
    );
  };

  return (
    <Sidebar>
      {/* <EditEmail
        open={isOpenEditEmail}
        onClose={() => setIsOpenEditEmail(false)}
        sendInvoice={handleSendInvoice}
        email={clientValue?.email || ''}
        showNotification={showNotification}
        userId={clientValue?.id || -1}
      /> */}
      {NotificationComp}

      {renderHeader()}
      {renderClientSelector()}

      {!reportState.clientValue ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            👆 Select a client above to view their reports
          </Typography>
        </Box>
      ) : (
        <ShadowSection display="flex" alignItems="center">
          <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={0}>
            {renderOverviewCards()}
            {renderTabs()}
            {renderTabContent()}
          </Paper>
        </ShadowSection>
      )}
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
