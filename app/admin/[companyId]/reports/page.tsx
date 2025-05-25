'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Autocomplete,
  Box,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ShadowSection } from './styled';
import { UserType } from '@/app/utils/type';
import {
  ORDER_STATUS,
  PAYMENT_TYPE,
  USER_CATEGORIZED,
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
import { renderType } from '@/app/lib/render';
import { PriceChange } from '@mui/icons-material';
import OrderInReportPage from './OrderInReportPage';
import ChequeTab from './ChequeTab';
import { useParams } from 'next/navigation';
// import { handleSearch } from '@/app/utils/search';

export default function ReportPage() {
  const { companyId }: any = useParams();
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const { showNotification, NotificationComp } = useNotification();

  const { date: datePicker, SelectDate } = useSelectDate();

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  // Data Fetching
  const [orders, mutateOrders] = SWRFetchData(
    !clientValue
      ? ''
      : clientValue?.clientName === 'All Clients'
        ? getAdminApiUrl(
            companyId,
            `/clients/orders?deliveryDate=${datePicker}`,
          )
        : getAdminApiUrl(
            companyId,
            `/clients/orders?userId=${clientValue?.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
          ),
  );
  // const [routes, mutateRoutes] = SWRFetchData(
  //   `${API_URL.ROUTES}?day=${days[currentDate.getDay()]}`,
  // );
  const [clients] = SWRFetchData(getAdminApiUrl(companyId, '/clients'));

  const totalBill = useMemo(() => {
    if (!clientOrders || clientOrders.length === 0) {
      return { bill: 0, profit: 0 };
    }

    const bill = clientOrders.reduce((acc: any, cV: Order) => {
      if (!acc.bill) {
        acc.bill = 0;
      }

      if (!acc.profit) {
        acc.profit = 0;
      }

      if (cV.status === ORDER_STATUS.VOID) {
        return acc;
      }

      acc.bill += cV.totalPrice;
      acc.profit += cV?.profit || 0;

      return acc;
    }, {});

    return bill;
  }, [clientOrders]);

  const unpaidBill = useMemo(() => {
    const clientUnpaidOrders = clientOrders.filter((order: Order) => {
      return (
        order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.INCOMPLETED
      );
    });

    const unpaidBill = clientUnpaidOrders.reduce((acc: number, cV: Order) => {
      return acc + cV.totalPrice;
    }, 0);

    return unpaidBill;
  }, [unpaidOrders]);

  // Reset display data
  useEffect(() => {
    if (clientOrders.length === 0) {
      setSelectedOrders([]);
    }
  }, [clientOrders]);

  useEffect(() => {
    if (orders && clientValue && (dateRange.length > 0 || datePicker)) {
      initializeOrders();
    } else {
      setClientOrders([]);
      setBaseClientOrders([]);
    }
  }, [clientValue, dateRange, datePicker, orders?.data]);

  useEffect(() => {
    if (
      clientValue?.clientName === 'All Clients' ||
      clientValue?.preference?.paymentType !== PAYMENT_TYPE.MONTHLY
    ) {
      setTabIndex(0);
    }
  }, [clientValue]);

  // useEffect(() => {
  //   if (datePicker) {
  //     mutateRoutes();
  //   }
  // }, [datePicker]);

  // useEffect(() => {
  //   if (debouncedKeywords) {
  //     const newOrderData = baseClientOrders.filter((order: Order) => {
  //       if (
  //         order.id.toString().includes(debouncedKeywords) ||
  //         order.user.clientId === debouncedKeywords ||
  //         order.user.clientName
  //           .toLowerCase()
  //           .includes(debouncedKeywords.toLowerCase()) ||
  //         order.status.toLowerCase() === debouncedKeywords.toLowerCase()
  //       ) {
  //         return true;
  //       }
  //       return false;
  //     });
  //     setClientOrders(newOrderData);
  //   } else {
  //     setClientOrders(baseClientOrders);
  //   }
  // }, [debouncedKeywords, baseClientOrders]);

  const initializeOrders = () => {
    let orderData = orders.data;
    if (clientValue?.clientName !== 'All Clients') {
      orderData = filterDateRangeOrders(
        orders.data,
        dateRange[0],
        dateRange[1],
      );
    }

    const newUnpaidOrders = orderData.filter((order: Order) => {
      return (
        order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.INCOMPLETED
      );
    });

    if (selectedOrders.length > 0) {
      const newSelectedOrders = selectedOrders.map((order: Order) => {
        const newOrder = orders?.data.find((o: Order) => {
          return o.id === order.id;
        });

        return newOrder;
      });

      setSelectedOrders(newSelectedOrders);
    }
    setUnpaidOrders(newUnpaidOrders);
    setClientOrders(orderData);
    setBaseClientOrders(orderData);
    setIsFetching(false);
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

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" color={blueGrey[800]}>
          Reports
        </Typography>
        {clientValue?.clientName === 'All Clients' ? (
          <>{SelectDate}</>
        ) : (
          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        )}
      </Box>
      <ShadowSection display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6" color={blueGrey[800]} sx={{ mb: 1 }}>
          Clients
        </Typography>
        <Autocomplete
          options={
            [
              {
                clientId: '',
                clientName: 'All Clients',
                deliveryAddress: '',
              },
              ...(clients?.data || []),
            ] as UserType[]
          }
          getOptionLabel={(option) => {
            if (option.clientName === 'All Clients') {
              return option.clientName;
            }

            return `${option.clientName} - ${option.clientId}`;
          }}
          renderInput={(params) => <TextField {...params} label="Client" />}
          renderOption={(props: any, option: any) => {
            return (
              <li {...props}>
                <Box display="flex" gap={2} alignItems="center">
                  <Typography>
                    {option.clientName} - {option.clientId}
                  </Typography>
                  {option?.type &&
                    option.type !== USER_CATEGORIZED.NONE &&
                    renderType(option.type)}
                </Box>
              </li>
            );
          }}
          value={clientValue}
          onChange={(e, newValue) => setClientValue(newValue)}
          sx={{ width: 'auto' }}
        />
      </ShadowSection>
      <ShadowSection display="flex" alignItems="center">
        <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={0}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <OverviewCard
                icon={<ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />}
                text="Total Orders"
                value={clientOrders.length}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <OverviewCard
                icon={
                  <MonetizationOnIcon sx={{ fontSize: 50 }} color="primary" />
                }
                text="Total Bill"
                value={`$${totalBill.bill.toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <OverviewCard
                icon={
                  <MonetizationOnIcon sx={{ fontSize: 50 }} color="primary" />
                }
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
                  icon={
                    <MoneyOffCsredIcon
                      sx={{ color: blue[700], fontSize: 50 }}
                    />
                  }
                  text="Over Due"
                  value={orders?.overDueAmount?.toFixed(2)}
                />
              ) : (
                <OverviewCard
                  icon={<PendingIcon sx={{ color: blue[700], fontSize: 50 }} />}
                  text="Unpaid orders"
                  value={unpaidOrders.length}
                />
              )}
            </Grid>
            {/* <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <OverviewCard
                icon={<PendingIcon sx={{ color: blue[700], fontSize: 50 }} />}
                text="Unpaid orders"
                value={unpaidOrders.length}
              />
            </Grid> */}
          </Grid>

          <Tabs
            value={tabIndex}
            onChange={(e: any, value: number) => setTabIndex(value)}
            variant={smDown ? 'fullWidth' : 'scrollable'}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Orders" value={0} />
            <Tab
              label="Cheques"
              value={1}
              disabled={
                clientValue?.clientName === 'All Clients' ||
                clientValue?.preference?.paymentType !== PAYMENT_TYPE.MONTHLY
              }
            />
          </Tabs>

          {tabIndex === 0 ? (
            <OrderInReportPage
              clientOrders={clientOrders}
              setClientOrders={setClientOrders}
              showNotification={showNotification}
              isFetching={isFetching}
              clientValue={clientValue}
              dateRange={dateRange}
              setUnpaidOrders={setUnpaidOrders}
              mutateOrders={mutateOrders}
              datePicker={datePicker}
              baseClientOrders={baseClientOrders}
              setBaseClientOrders={setBaseClientOrders}
            />
          ) : (
            <ChequeTab
              client={clientValue}
              showNotification={showNotification}
            />
          )}
        </Paper>
      </ShadowSection>
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
