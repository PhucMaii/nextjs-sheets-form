'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { ShadowSection } from './styled';
import { UserType } from '@/app/utils/type';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import { Order } from '../orders/page';
import ErrorComponent from '../components/ErrorComponent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import SelectDateRange from '../components/SelectDateRange';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { blue, blueGrey } from '@mui/material/colors';
import useDebounce from '@/hooks/useDebounce';
import ClientOrdersTable from '../components/Tables/ClientOrdersTable';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { generateMonthRange } from '@/app/utils/time';
import { useReactToPrint } from 'react-to-print';
import { InvoicePrint } from '../components/Printing/InvoicePrint';
import { DropdownItemContainer } from '../orders/styled';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '@/theme/color';
import { days } from '@/app/lib/constant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteIcon from '@mui/icons-material/Delete';
import { MemoizedAllPrint } from '../components/Printing/AllPrint';
import { pusherClient } from '@/app/pusher';
import {
  convertDeliveryDateStringToDate,
  filterDateRangeOrders,
} from '@/pages/api/utils/date';
import BillPrintModal from '../components/Modals/BillPrintModal';
import { SWRFetchData } from '@/app/utils/db';
import { WeeklyStatement } from '../components/Printing/WeeklyStatement';
import useSelectDate from '@/hooks/useSelectDate';
import useNotification from '@/hooks/useNotification';
import RouteStatement from '../components/Modals/RouteStatement';
import LoadingModal from '../components/Modals/LoadingModal';
import EditEmail from '../components/Modals/edit/EditEmail';
// import { handleSearch } from '@/app/utils/search';

export default function ReportPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openActionsDropdown = Boolean(actionButtonAnchor);
  const [statementAnchor, setStatementAnchor] = useState<null | HTMLElement>(
    null,
  );
  const openStatementDropdown = Boolean(statementAnchor);
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [deletedOrder, setDeletedOrder] = useState<Order | null>(null);
  const [isSendAndPrintLoading, setIsSendAndPrintLoading] =
    useState<boolean>(false);
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isOpenEditEmail, setIsOpenEditEmail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenBillPrintModal, setIsOpenBillPrintModal] =
    useState<boolean>(false);
  const [isOpenRouteStatement, setIsOpenRouteStatement] =
    useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const { showNotification, NotificationComp } = useNotification();

  // Printing Refs
  const invoicePrint: any = useRef();
  const billPrint: any = useRef();
  const weeklyPrint: any = useRef();

  const { date: datePicker, SelectDate } = useSelectDate();

  // Data Fetching
  const currentDate = convertDeliveryDateStringToDate(datePicker);
  const [orders, mutateOrders] = SWRFetchData(
    !clientValue
      ? ''
      : clientValue?.clientName === 'All Clients'
        ? `${API_URL.ADMIN}/clients/orders?deliveryDate=${datePicker}`
        : `${API_URL.ADMIN}/clients/orders?userId=${clientValue?.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );
  const [routes, mutateRoutes] = SWRFetchData(
    `${API_URL.ROUTES}?day=${days[currentDate.getDay()]}`,
  );
  const [clients] = SWRFetchData(API_URL.CLIENTS);

  const totalBill = useMemo(() => {
    if (!clientOrders || clientOrders.length === 0) {
      return 0;
    }

    const bill = clientOrders.reduce((acc: number, cV: Order) => {
      // Only calculate total incompleted and completed orders
      if (
        cV.status === ORDER_STATUS.DELIVERED ||
        cV.status === ORDER_STATUS.INCOMPLETED
      ) {
        return acc + cV.totalPrice;
      }
      return acc + 0;
    }, 0);

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

  useEffect(() => {
    if (datePicker) {
      mutateRoutes();
    }
  }, [datePicker]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderData = baseClientOrders.filter((order: Order) => {
        if (
          order.id.toString().includes(debouncedKeywords) ||
          order.user.clientId === debouncedKeywords ||
          order.user.clientName
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase()) ||
          order.status.toLowerCase() === debouncedKeywords.toLowerCase()
        ) {
          return true;
        }
        return false;
      });
      // const newOrderData = handleSearch(debouncedKeywords, baseClientOrders, [
      //   'id',
      //   'user.clientId',
      //   'user.clientName',
      //   'status',
      // ]);
      setClientOrders(newOrderData);
    } else {
      setClientOrders(baseClientOrders);
    }
  }, [debouncedKeywords, baseClientOrders]);

  // const calculateTotalBill = () => {
  //   const bill = clientOrders.reduce((acc: number, cV: Order) => {
  //     // Only calculate total incompleted and completed orders
  //     if (
  //       cV.status === ORDER_STATUS.DELIVERED ||
  //       cV.status === ORDER_STATUS.INCOMPLETED
  //     ) {
  //       return acc + cV.totalPrice;
  //     }
  //     return acc + 0;
  //   }, 0);

  //   setTotalBill(bill);
  // };

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
    setUnpaidOrders(newUnpaidOrders);
    setClientOrders(orderData);
    setBaseClientOrders(orderData);
    setIsFetching(false);
  };

  const handleCloseActionsAnchor = () => {
    setActionButtonAnchor(null);
  };

  const handleCloseStatementAnchor = () => {
    setStatementAnchor(null);
  };

  const handleDeleteOrderUI = (deletedOrder: Order) => {
    // update base order list
    const newBaseOrderList = baseClientOrders.filter((order: Order) => {
      return order.id !== deletedOrder.id;
    });

    // update current displaying list
    const newOrderList = clientOrders.filter((order: Order) => {
      return order.id !== deletedOrder.id;
    });

    // update unpaid order list
    if (
      deletedOrder.status === ORDER_STATUS.INCOMPLETED ||
      deletedOrder.status === ORDER_STATUS.DELIVERED
    ) {
      const newUnpaidOrders = newBaseOrderList.filter((order: Order) => {
        return (
          order.status === ORDER_STATUS.INCOMPLETED ||
          order.status === ORDER_STATUS.DELIVERED
        );
      });
      setUnpaidOrders(newUnpaidOrders);
    }

    setBaseClientOrders(newBaseOrderList);
    setClientOrders(newOrderList);
  };

  const handleInvoicePrint = useReactToPrint({
    content: () => invoicePrint.current,
  });

  const handleBillPrint = useReactToPrint({
    content: () => billPrint.current,
  });

  const handleWeeklyPrint = useReactToPrint({
    content: () => weeklyPrint.current,
  });

  const handleSelectOrder = (e: any, targetOrder: Order) => {
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

  const handleSelectAll = () => {
    if (selectedOrders.length === clientOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(clientOrders);
    }
  };

  const handleUpdateOrderUI = (updatedOrder: Order) => {
    // update base order list
    const newBaseOrderList = baseClientOrders.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    // update current displaying order list
    const newOrderList = clientOrders.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    // update completed order list
    const newUnpaidOrders = newBaseOrderList.filter((order: Order) => {
      return order.status === ORDER_STATUS.COMPLETED;
    });

    setBaseClientOrders(newBaseOrderList);
    setClientOrders(newOrderList);
    setUnpaidOrders(newUnpaidOrders);
  };

  const handleDeleteSelectedOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL.CLIENTS}/orders`, {
        data: { orderList: selectedOrders },
      });

      showNotification('success', response.data.message);
      setIsLoading(false);
      setSelectedOrders([]);
    } catch (error: any) {
      console.log('Fail to delete orders: ', error);
      showNotification('error', 'Fail to delete orders: ' + error);
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.put(API_URL.ORDER_STATUS, {
        status,
        updatedOrders: selectedOrders,
      });

      mutateOrders();

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
      showNotification(
        'error',
        'Something went wrong. Please try again later - ERROR: ' + (error?.response?.data?.error || error),
      );
      setIsLoading(false);
    }
  };

  const handleSendInvoice = async (
    email: string = clientValue?.email || '',
  ) => {
    try {
      const response = await axios.post(`${API_URL.ADMIN}/sendInvoicePdf`, {
        client: { ...clientValue, email },
        orders: selectedOrders.length > 0 ? selectedOrders : clientOrders,
        endDate: dateRange[1],
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
    }
  };

  const statementDropdown = (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <Button
        disabled={clientOrders.length === 0 || isFetching}
        variant="outlined"
        onClick={(e) => {
          if (clientValue?.clientName === 'All Clients') {
            setIsOpenRouteStatement(true);
          } else {
            setStatementAnchor(e.currentTarget);
          }
        }}
        fullWidth
      >
        <Box display="flex" gap={2}>
          <Typography>Statement</Typography>
          <ArrowDownwardIcon />
        </Box>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={statementAnchor}
        open={openStatementDropdown}
        onClose={handleCloseStatementAnchor}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            handleWeeklyPrint();
            handleCloseStatementAnchor();
          }}
        >
          Weekly
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleInvoicePrint();
            handleCloseStatementAnchor();
          }}
        >
          Print
        </MenuItem>
        <MenuItem
          disabled={!clientValue?.email || false}
          onClick={async () => {
            setIsOpenEditEmail(true);
            // setIsSendLoading(true);
            // await handleSendInvoice();
            // setIsSendLoading(false);
            // handleCloseStatementAnchor();
          }}
        >
          {'Send to client'}
        </MenuItem>
        <MenuItem
          disabled={!clientValue?.email || false}
          onClick={async () => {
            setIsSendAndPrintLoading(true);
            handleInvoicePrint();
            await handleSendInvoice();
            setIsSendAndPrintLoading(false);
            // handleCloseStatementAnchor();
          }}
        >
          {isSendAndPrintLoading ? (
            <CircularProgress size={20} />
          ) : (
            'Print and Send'
          )}
        </MenuItem>
      </Menu>
    </Box>
  );

  const statusDropdown = (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <Button
        aria-controls={openActionsDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openActionsDropdown ? 'true' : undefined}
        disabled={selectedOrders.length === 0}
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
        open={openActionsDropdown}
        onClose={handleCloseActionsAnchor}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.COMPLETED);
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Mark as completed</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.DELIVERED);
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Mark as delivered</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.INCOMPLETED);
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Mark as incompleted</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.VOID);
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <BlockIcon sx={{ color: errorColor }} />
            <Typography>Mark as void</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteSelectedOrders();
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <DeleteIcon sx={{ color: errorColor }} />
            <Typography>Delete</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Sidebar>
      <EditEmail
        open={isOpenEditEmail}
        onClose={() => setIsOpenEditEmail(false)}
        sendInvoice={handleSendInvoice}
        email={clientValue?.email || ''}
        showNotification={showNotification}
        userId={clientValue?.id || -1}
      />
      <LoadingModal open={isLoading} />
      {NotificationComp}

      {/* PRINT SLOWS DOWN THE PAGE */}
      {clientValue?.clientName !== 'All Clients' && (
        <div style={{ display: 'none' }}>
          <InvoicePrint
            client={clientValue}
            orders={selectedOrders.length > 0 ? selectedOrders : clientOrders}
            endDate={dateRange[1]}
            ref={invoicePrint}
          />
          <WeeklyStatement
            client={clientValue}
            orders={selectedOrders.length > 0 ? selectedOrders : clientOrders}
            endDate={dateRange[1]}
            ref={weeklyPrint}
          />
        </div>
      )}
      {/* {clientValue?.clientName === 'All Clients' && ( */}
        <div style={{ display: 'none' }}>
          <MemoizedAllPrint
            orders={selectedOrders.length > 0 ? selectedOrders : clientOrders}
            ref={billPrint}
          />
        </div>
      {/* )} */}
      {clientValue?.clientName === 'All Clients' && (
        <>
          <BillPrintModal
            open={isOpenBillPrintModal}
            onClose={() => setIsOpenBillPrintModal(false)}
            routes={routes?.data || []}
            orderList={
              selectedOrders.length > 0 ? selectedOrders : clientOrders
            }
            showNotification={showNotification}
            day={datePicker}
          />
          <RouteStatement
            open={isOpenRouteStatement}
            onClose={() => setIsOpenRouteStatement(false)}
            currentDateRange={dateRange}
          />
        </>
      )}
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
          value={clientValue}
          onChange={(e, newValue) => setClientValue(newValue)}
          sx={{ width: 'auto' }}
        />
      </ShadowSection>
      <ShadowSection display="flex" alignItems="center">
        <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={0}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <OverviewCard
                icon={<ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />}
                text="Total Orders"
                value={clientOrders.length}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <OverviewCard
                icon={
                  <AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />
                }
                text="Total Bill"
                value={`$${totalBill.toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <OverviewCard
                icon={
                  <CheckCircleOutlineIcon
                    sx={{ color: blue[700], fontSize: 50 }}
                  />
                }
                text="Unpaid orders"
                value={unpaidOrders.length}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1} alignItems="center">
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
              handleDeleteOrderUI={handleDeleteOrderUI}
              handleUpdateOrderUI={handleUpdateOrderUI}
              clientOrders={clientOrders}
              showNotification={showNotification}
              selectedOrders={selectedOrders}
              handleSelectOrder={handleSelectOrder}
              handleSelectAll={handleSelectAll}
              // subCategories={subCategories?.data || []}
              mutateOrders={mutateOrders}
            />
          ) : (
            <ErrorComponent errorText="No Order Available" />
          )}
        </Paper>
      </ShadowSection>
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
