'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { ShadowSection } from './styled';
import { Notification, UserType } from '@/app/utils/type';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import NotificationPopup from '../components/Notification';
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
import { blue } from '@mui/material/colors';
import useDebounce from '@/hooks/useDebounce';
import ClientOrdersTable from '../components/ClientOrdersTable';
import AuthenGuard from '@/app/HOC/AuthenGuard';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import {
  YYYYMMDDFormat,
  formatDateChanged,
  generateMonthRange,
} from '@/app/utils/time';
import { useReactToPrint } from 'react-to-print';
import { InvoicePrint } from '../components/Printing/InvoicePrint';
import { DropdownItemContainer } from '../orders/styled';
import { errorColor, successColor, warningColor } from '@/app/theme/color';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { limitOrderHour } from '@/app/lib/constant';

export default function ReportPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [baseClientOrders, setBaseClientOrders] = useState<Order[]>([]);
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [datePicker, setDatePicker] = useState<string>(() => {
    // format initial date
    const dateObj = new Date();
    // if current hour is greater limit hour, then recommend the next day
    if (dateObj.getHours() >= limitOrderHour) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    const formattedDate = YYYYMMDDFormat(dateObj);
    return formattedDate;
  });
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [totalBill, setTotalBill] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const invoicePrint: any = useRef();

  useEffect(() => {
    fetchAllClients();
  }, []);

  useEffect(() => {
    if (clientOrders.length > 0) {
      calculateTotalBill();
    } else {
      setTotalBill(0);
    }
  }, [clientOrders]);

  useEffect(() => {
    if (clientValue && (dateRange.length > 0 || datePicker)) {
      fetchClientOrders();
    } else {
      setClientOrders([]);
      setBaseClientOrders([]);
    }
  }, [clientValue, dateRange, datePicker]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderData = baseClientOrders.filter((order: Order) => {
        if (
          order.id.toString().includes(debouncedKeywords) ||
          order.status.toLowerCase() === debouncedKeywords.toLowerCase()
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

  const calculateTotalBill = () => {
    const bill = clientOrders.reduce((acc: number, cV: Order) => {
      // Only calculate total incompleted and completed orders
      if (
        cV.status === ORDER_STATUS.COMPLETED ||
        cV.status === ORDER_STATUS.INCOMPLETED
      ) {
        return acc + cV.totalPrice;
      }
      return acc + 0;
    }, 0);

    setTotalBill(bill);
  };

  const fetchAllClients = async () => {
    try {
      const response = await axios.get(API_URL.CLIENTS);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      const allClients = {
        clientId: '',
        clientName: 'All Clients',
        deliveryAddress: '',
      };

      setClientList([allClients, ...response.data.data]);
    } catch (error: any) {
      console.log('Fail to fetch all clients: ' + error);
    }
  };

  const fetchClientOrders = async () => {
    try {
      setIsFetching(true);
      let response;
      if (clientValue?.clientName === 'All Clients') {
        response = await axios.get(
          `${API_URL.CLIENTS}/orders?deliveryDate=${datePicker}`,
        );
      } else {
        response = await axios.get(
          `${API_URL.CLIENTS}/orders?userId=${clientValue?.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
        );
      }

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      const newCompletedOrders = response.data.data.filter((order: Order) => {
        return order.status === ORDER_STATUS.COMPLETED;
      });

      setCompletedOrders(newCompletedOrders);
      setClientOrders(response.data.data);
      setBaseClientOrders(response.data.data);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client orders: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch client orders: ' + error,
      });
      setIsFetching(false);
    }
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const handleDateChange = (e: any) => {
    const formattedDate = formatDateChanged(e);
    setDatePicker(formattedDate);
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

    // update completed order list
    if (deletedOrder.status === ORDER_STATUS.COMPLETED) {
      const newCompletedOrders = newBaseOrderList.filter((order: Order) => {
        return order.status === ORDER_STATUS.COMPLETED;
      });
      setCompletedOrders(newCompletedOrders);
    }

    setBaseClientOrders(newBaseOrderList);
    setClientOrders(newOrderList);
  };

  const handleInvoicePrint = useReactToPrint({
    content: () => invoicePrint.current,
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
    const newCompletedOrders = newBaseOrderList.filter((order: Order) => {
      return order.status === ORDER_STATUS.COMPLETED;
    });

    setBaseClientOrders(newBaseOrderList);
    setClientOrders(newOrderList);
    setCompletedOrders(newCompletedOrders);
  };

  const handleUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
    try {
      const response = await axios.put(API_URL.ORDER_STATUS, {
        status,
        updatedOrders: selectedOrders,
      });
      await fetchClientOrders();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
    }
  };

  const statusDropdown = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <Button
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        disabled={selectedOrders.length === 0}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
        endIcon={<ArrowDownwardIcon />}
        variant="outlined"
        fullWidth
      >
        Update Status
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
            handleUpdateStatus(ORDER_STATUS.COMPLETED);
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Mark as completed</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.INCOMPLETED);
            handleCloseAnchor();
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
            handleCloseAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <BlockIcon sx={{ color: errorColor }} />
            <Typography>Mark as void</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Sidebar>
      <AuthenGuard>
        <div style={{ display: 'none' }}>
          <InvoicePrint
            client={clientValue}
            orders={selectedOrders.length > 0 ? selectedOrders : clientOrders}
            ref={invoicePrint}
          />
        </div>
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification({ ...notification, on: false })}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Reports</Typography>
          {clientValue?.clientName === 'All Clients' ? (
            <>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dayjs(datePicker)}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
            </>
          ) : (
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          )}
        </Box>
        <ShadowSection display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6">Clients</Typography>
          <Autocomplete
            options={clientList as UserType[]}
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
                  text="Completed orders"
                  value={completedOrders.length}
                />
              </Grid>
            </Grid>
            <Grid container columnSpacing={1} alignItems="center">
              <Grid item md={2}>
                {statusDropdown}
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  variant="filled"
                  // label="Search orders"
                  placeholder="Search by invoice id or status"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                />
              </Grid>
              <Grid item md={2} textAlign="right">
                <Button
                  disabled={clientOrders.length === 0}
                  variant="outlined"
                  onClick={handleInvoicePrint}
                >
                  <Box display="flex" gap={2}>
                    <LocalPrintshopIcon />
                    <Typography>Print</Typography>
                  </Box>
                </Button>
              </Grid>
            </Grid>
            {isFetching ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ width: '100%', mt: 2 }}
              >
                <LoadingComponent color="blue" />
              </Box>
            ) : clientOrders.length > 0 ? (
              <ClientOrdersTable
                handleDeleteOrderUI={handleDeleteOrderUI}
                handleUpdateOrderUI={handleUpdateOrderUI}
                clientOrders={clientOrders}
                setNotification={setNotification}
                selectedOrders={selectedOrders}
                handleSelectOrder={handleSelectOrder}
                handleSelectAll={handleSelectAll}
                isAdmin
              />
            ) : (
              <ErrorComponent errorText="No Order Available" />
            )}
          </Paper>
        </ShadowSection>
      </AuthenGuard>
    </Sidebar>
  );
}
