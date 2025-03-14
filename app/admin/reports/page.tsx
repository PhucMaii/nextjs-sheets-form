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
} from '@mui/material';
import { ShadowSection } from './styled';
import { UserType } from '@/app/utils/type';
import { API_URL, ORDER_STATUS, USER_CATEGORIZED } from '@/app/utils/enum';
import { Order } from '../orders/page';
import SelectDateRange from '../components/Select/SelectDateRange';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingIcon from '@mui/icons-material/Pending';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { blue, blueGrey } from '@mui/material/colors';
import { generateMonthRange } from '@/app/utils/time';
import MoneyOffCsredIcon from '@mui/icons-material/MoneyOffCsred';
import { pusherClient } from '@/app/pusher';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import { SWRFetchData } from '@/app/utils/db';
import useSelectDate from '@/hooks/useSelectDate';
import useNotification from '@/hooks/useNotification';
import { renderType } from '@/app/lib/render';
import { PriceChange } from '@mui/icons-material';
import OrderInReportPage from './OrderInReportPage';
import ChequeTab from './ChequeTab';
// import { handleSearch } from '@/app/utils/search';

export default function ReportPage() {
  // const [actionButtonAnchor, setActionButtonAnchor] =
  //   useState<null | HTMLElement>(null);
  // const openActionsDropdown = Boolean(actionButtonAnchor);
  // const [statementAnchor, setStatementAnchor] = useState<null | HTMLElement>(
  //   null,
  // );
  // const openStatementDropdown = Boolean(statementAnchor);
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [deletedOrder, setDeletedOrder] = useState<Order | null>(null);
  // const [isSendAndPrintLoading, setIsSendAndPrintLoading] =
  //   useState<boolean>(false);
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  // const [isOpenEditEmail, setIsOpenEditEmail] = useState<boolean>(false);
  // // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isOpenBillPrintModal, setIsOpenBillPrintModal] =
  //   useState<boolean>(false);
  // const [isOpenRouteStatement, setIsOpenRouteStatement] =
  //   useState<boolean>(false);
  // const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);

  // const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const { showNotification, NotificationComp } = useNotification();

  // Printing Refs
  // const invoicePrint: any = useRef();
  // const billPrint: any = useRef();
  // const weeklyPrint: any = useRef();

  const { date: datePicker, SelectDate } = useSelectDate();

  // Data Fetching
  // const currentDate = convertDeliveryDateStringToDate(datePicker);
  const [orders, mutateOrders] = SWRFetchData(
    !clientValue
      ? ''
      : clientValue?.clientName === 'All Clients'
        ? `${API_URL.ADMIN}/clients/orders?deliveryDate=${datePicker}`
        : `${API_URL.ADMIN}/clients/orders?userId=${clientValue?.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );
  // const [routes, mutateRoutes] = SWRFetchData(
  //   `${API_URL.ROUTES}?day=${days[currentDate.getDay()]}`,
  // );
  const [clients] = SWRFetchData(API_URL.CLIENTS);

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

  useEffect(() => {
    pusherClient?.subscribe('admin-delete-order');

    pusherClient?.bind('delete-order', (deletedOrder: Order) => {
      showNotification(
        'success',
        `Order ${deletedOrder.id} deleted successfully`,
      );
      setDeletedOrder(deletedOrder);
    });

    return () => {
      pusherClient?.unsubscribe('admin-delete-order');
    };
  }, []);

  useEffect(() => {
    if (deletedOrder) {
      const newClientOrders = clientOrders.filter((order: Order) => {
        return order.id !== deletedOrder.id;
      });

      const newBaseClientOrders = clientOrders.filter((order: Order) => {
        return order.id !== deletedOrder.id;
      });

      setClientOrders(newClientOrders);
      setBaseClientOrders(newBaseClientOrders);
    }
  }, [deletedOrder]);

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

  // const handleCloseActionsAnchor = () => {
  //   setActionButtonAnchor(null);
  // };

  // const handleCloseStatementAnchor = () => {
  //   setStatementAnchor(null);
  // };

  // const handleInvoicePrint = useReactToPrint({
  //   content: () => invoicePrint.current,
  // });

  // const handleBillPrint = useReactToPrint({
  //   content: () => billPrint.current,
  // });

  // const handleWeeklyPrint = useReactToPrint({
  //   content: () => weeklyPrint.current,
  // });

  // const handleSelectOrder = (e: any, targetOrder: Order) => {
  //   e.preventDefault();
  //   onSelectOrders(targetOrder, selectedOrders, setSelectedOrders);
  // };

  // const handleSelectAll = () => {
  //   onSelectAllOrders(selectedOrders, clientOrders, setSelectedOrders);
  // };

  // const onUpdateOrderUI = (updatedOrder: Order) => {
  //   // update base order list
  //   const newBaseOrderList = baseClientOrders.map((order: Order) => {
  //     if (order.id === updatedOrder.id) {
  //       return updatedOrder;
  //     }
  //     return order;
  //   });

  //   // update current displaying order list
  //   const newOrderList = clientOrders.map((order: Order) => {
  //     if (order.id === updatedOrder.id) {
  //       return updatedOrder;
  //     }
  //     return order;
  //   });

  //   // update completed order list
  //   const newUnpaidOrders = newBaseOrderList.filter((order: Order) => {
  //     return order.status === ORDER_STATUS.COMPLETED;
  //   });

  //   setBaseClientOrders(newBaseOrderList);
  //   setClientOrders(newOrderList);
  //   setUnpaidOrders(newUnpaidOrders);
  // };

  // const handleDeleteSelectedOrders = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await axios.delete(`${API_URL.CLIENTS}/orders`, {
  //       data: { orderList: selectedOrders },
  //     });

  //     showNotification('success', response.data.message);
  //     setIsLoading(false);
  //     setSelectedOrders([]);
  //   } catch (error: any) {
  //     console.log('Fail to delete orders: ', error);
  //     showNotification('error', 'Fail to delete orders: ' + error);
  //     setIsLoading(false);
  //   }
  // };

  // const handleUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
  //   setIsLoading(true);

  //   const updatedOrderIds = selectedOrders.map((order: Order) => {
  //     return order.id;
  //   });
  //   try {
  //     const response = await axios.put(API_URL.ORDER_STATUS, {
  //       status,
  //       updatedOrderIds,
  //     });

  //     mutateOrders();

  //     showNotification('success', response.data.message);
  //     setIsLoading(false);
  //   } catch (error: any) {
  //     console.log('Fail to mark all as completed: ', error);
  //     showNotification(
  //       'error',
  //       'Something went wrong. Please try again later - ERROR: ' +
  //         (error?.response?.data?.error || error),
  //     );
  //     setIsLoading(false);
  //   }
  // };

  // const handleSendInvoice = async (
  //   email: string = clientValue?.email || '',
  // ) => {
  //   try {
  //     const response = await axios.post(`${API_URL.ADMIN}/sendInvoicePdf`, {
  //       client: { ...clientValue, email },
  //       orders: selectedOrders.length > 0 ? selectedOrders : clientOrders,
  //       endDate: dateRange[1],
  //     });

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       return;
  //     }

  //     showNotification('success', response.data.message);
  //   } catch (error: any) {
  //     console.log('There was an error: ', error);
  //     showNotification(
  //       'error',
  //       'There was an error: ' + error.response.data.error,
  //     );
  //   }
  // };

  // const statementDropdown = (
  //   <Box
  //     display="flex"
  //     justifyContent="flex-end"
  //     alignItems="center"
  //     gap={2}
  //     width="100%"
  //   >
  //     <Button
  //       disabled={clientOrders.length === 0 || isFetching}
  //       variant="outlined"
  //       onClick={(e) => {
  //         if (clientValue?.clientName === 'All Clients') {
  //           setIsOpenRouteStatement(true);
  //         } else {
  //           setStatementAnchor(e.currentTarget);
  //         }
  //       }}
  //       fullWidth
  //     >
  //       <Box display="flex" gap={2}>
  //         <Typography>Statement</Typography>
  //         <ArrowDownwardIcon />
  //       </Box>
  //     </Button>
  //     <Menu
  //       id="basic-menu"
  //       anchorEl={statementAnchor}
  //       open={openStatementDropdown}
  //       onClose={handleCloseStatementAnchor}
  //       MenuListProps={{
  //         'aria-labelledby': 'basic-button',
  //       }}
  //     >
  //       <MenuItem onClick={() => setIsOpenUploadChequeModal(true)}>
  //         Upload Cheque
  //       </MenuItem>
  //       <Divider />
  //       <MenuItem
  //         onClick={() => {
  //           handleWeeklyPrint();
  //           handleCloseStatementAnchor();
  //         }}
  //       >
  //         Weekly
  //       </MenuItem>
  //       <MenuItem
  //         onClick={() => {
  //           handleInvoicePrint();
  //           handleCloseStatementAnchor();
  //         }}
  //       >
  //         Print
  //       </MenuItem>
  //       <MenuItem
  //         disabled={!clientValue?.email || false}
  //         onClick={async () => {
  //           setIsOpenEditEmail(true);
  //         }}
  //       >
  //         {'Send to client'}
  //       </MenuItem>
  //       <MenuItem
  //         disabled={!clientValue?.email || false}
  //         onClick={async () => {
  //           setIsSendAndPrintLoading(true);
  //           handleInvoicePrint();
  //           await handleSendInvoice();
  //           setIsSendAndPrintLoading(false);
  //           // handleCloseStatementAnchor();
  //         }}
  //       >
  //         {isSendAndPrintLoading ? (
  //           <CircularProgress size={20} />
  //         ) : (
  //           'Print and Send'
  //         )}
  //       </MenuItem>
  //     </Menu>
  //   </Box>
  // );

  // const statusDropdown = (
  //   <Box
  //     display="flex"
  //     justifyContent="flex-end"
  //     alignItems="center"
  //     gap={2}
  //     width="100%"
  //   >
  //     <Button
  //       aria-controls={openActionsDropdown ? 'basic-menu' : undefined}
  //       aria-haspopup="true"
  //       aria-expanded={openActionsDropdown ? 'true' : undefined}
  //       disabled={selectedOrders.length === 0}
  //       onClick={(e) => setActionButtonAnchor(e.currentTarget)}
  //       endIcon={<ArrowDownwardIcon />}
  //       variant="outlined"
  //       fullWidth
  //     >
  //       Actions
  //     </Button>
  //     <Menu
  //       id="basic-menu"
  //       anchorEl={actionButtonAnchor}
  //       open={openActionsDropdown}
  //       onClose={handleCloseActionsAnchor}
  //       MenuListProps={{
  //         'aria-labelledby': 'basic-button',
  //       }}
  //     >
  //       <MenuItem
  //         onClick={() => {
  //           handleUpdateStatus(ORDER_STATUS.COMPLETED);
  //           handleCloseActionsAnchor();
  //         }}
  //       >
  //         <DropdownItemContainer display="flex" gap={2}>
  //           <CheckCircleIcon sx={{ color: successColor }} />
  //           <Typography>Mark as completed</Typography>
  //         </DropdownItemContainer>
  //       </MenuItem>
  //       <MenuItem
  //         onClick={() => {
  //           handleUpdateStatus(ORDER_STATUS.DELIVERED);
  //           handleCloseActionsAnchor();
  //         }}
  //       >
  //         <DropdownItemContainer display="flex" gap={2}>
  //           <LocalShippingIcon sx={{ color: infoColor }} />
  //           <Typography>Mark as delivered</Typography>
  //         </DropdownItemContainer>
  //       </MenuItem>
  //       <MenuItem
  //         onClick={() => {
  //           handleUpdateStatus(ORDER_STATUS.INCOMPLETED);
  //           handleCloseActionsAnchor();
  //         }}
  //       >
  //         <DropdownItemContainer display="flex" gap={2}>
  //           <PendingIcon sx={{ color: warningColor }} />
  //           <Typography>Mark as incompleted</Typography>
  //         </DropdownItemContainer>
  //       </MenuItem>
  //       <MenuItem
  //         onClick={() => {
  //           handleUpdateStatus(ORDER_STATUS.VOID);
  //           handleCloseActionsAnchor();
  //         }}
  //       >
  //         <DropdownItemContainer display="flex" gap={2}>
  //           <BlockIcon sx={{ color: errorColor }} />
  //           <Typography>Mark as void</Typography>
  //         </DropdownItemContainer>
  //       </MenuItem>
  //       <MenuItem
  //         onClick={() => {
  //           handleDeleteSelectedOrders();
  //           handleCloseActionsAnchor();
  //         }}
  //       >
  //         <DropdownItemContainer display="flex" gap={2}>
  //           <DeleteIcon sx={{ color: errorColor }} />
  //           <Typography>Delete</Typography>
  //         </DropdownItemContainer>
  //       </MenuItem>
  //     </Menu>
  //   </Box>
  // );

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
            <Grid item xs={12} md={4} lg={3}>
              <OverviewCard
                icon={<ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />}
                text="Total Orders"
                value={clientOrders.length}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <OverviewCard
                icon={
                  <MonetizationOnIcon sx={{ fontSize: 50 }} color="primary" />
                }
                text="Total Bill"
                value={`$${totalBill.bill.toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <OverviewCard
                icon={<PriceChange sx={{ fontSize: 50 }} color="primary" />}
                text="Profit"
                value={`$${totalBill.profit > 0 ? totalBill.profit.toFixed(2) : 0}`}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
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
            {/* <Grid item xs={12} md={4} lg={3}>
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
            variant="fullWidth"
            sx={{mb: 2}}
          >
            <Tab label="Orders" value={0} />
            <Tab
              label="Cheques"
              value={1}
              disabled={clientValue?.clientName === 'All Clients'}
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
            <ChequeTab client={clientValue} showNotification={showNotification} />
          )}

          {/* <Grid container spacing={1} alignItems="center">
            <Grid item md={2} xs={12}>
              {statusDropdown}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="filled"
                // label="Search orders"
                placeholder="Search by invoice id, client id, client name or status"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
              />
            </Grid>
            <Grid item md={2} textAlign="right">
              <Button
                disabled={clientOrders.length === 0}
                variant="outlined"
                onClick={() => {
                  if (clientValue?.clientName === 'All Clients') {
                    setIsOpenBillPrintModal(true);
                  } else {
                    handleBillPrint();
                  }
                }}
                fullWidth
              >
                <Box display="flex" gap={2}>
                  <LocalPrintshopIcon />
                  <Typography>Bill</Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item md={2} textAlign="right">
              {statementDropdown}
            </Grid>
          </Grid>
          {isFetching ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ width: '100%', mt: 2 }}
            >
              <LoadingComponent />
            </Box>
          ) : clientOrders.length > 0 ? (
            <ClientOrdersTable
              // handleDeleteOrderUI={handleDeleteOrderUI}
              // handleUpdateOrderUI={handleUpdateOrderUI}
              clientOrders={clientOrders}
              showNotification={showNotification}
              selectedOrders={selectedOrders}
              handleSelectOrder={handleSelectOrder}
              handleSelectAll={handleSelectAll}
              // subCategories={subCategories?.data || []}
              mutateOrders={mutateOrders}
              onUpdateOrderUI={onUpdateOrderUI}
            />
          ) : (
            <ErrorComponent errorText="No Order Available" />
          )} */}
        </Paper>
      </ShadowSection>
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
