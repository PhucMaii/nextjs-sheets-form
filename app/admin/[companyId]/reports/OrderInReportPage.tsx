import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  ListSubheader,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ClientOrdersTable from '../components/Tables/ClientOrdersTable';
import ErrorComponent from '../components/ErrorComponent';
import DeleteIcon from '@mui/icons-material/Delete';

import { Order } from '../orders/page';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { ORDER_STATUS, PAYMENT_TYPE, getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useReactToPrint } from 'react-to-print';
import { DropdownItemContainer } from '../orders/styled';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '@/theme/color';
import EditEmail from '../components/Modals/edit/EditEmail';
import LoadingModal from '../components/Modals/LoadingModal';
import {
  onSelectAllOrders,
  onSelectOrders,
  updateStatus,
} from '@/app/utils/orders';
import BillPrintModal from '../components/Modals/BillPrintModal';
import RouteStatement from '../components/Modals/RouteStatement';
import { SWRFetchData } from '@/app/utils/db';
import { days } from '@/app/lib/constant';
import { convertDeliveryDateStringToDate } from '@/pages/api/utils/date';
import { InvoicePrint } from '../components/Printing/InvoicePrint';
import { WeeklyStatement } from '../components/Printing/WeeklyStatement';
import { MemoizedAllPrint } from '../components/Printing/AllPrint';
import UploadChequeModal from '../components/Modals/UploadChequeModal';
import { useParams } from 'next/navigation';
import { PaymentStatus } from '@prisma/client';
import { MoneyOffOutlined } from '@mui/icons-material';

export default function OrderInReportPage({
  clientOrders,
  setClientOrders,
  baseClientOrders,
  setBaseClientOrders,
  showNotification,
  isFetching,
  clientValue,
  dateRange,
  setUnpaidOrders,
  mutateOrders,
  datePicker,
  searchKeywords,
  setSearchKeywords,
}: any) {
  const { companyId }: any = useParams();
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openActionsDropdown = Boolean(actionButtonAnchor);
  const [statementAnchor, setStatementAnchor] = useState<null | HTMLElement>(
    null,
  );
  const openStatementDropdown = Boolean(statementAnchor);
  const [isSendAndPrintLoading, setIsSendAndPrintLoading] =
    useState<boolean>(false);
  const [isOpenEditEmail, setIsOpenEditEmail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenBillPrintModal, setIsOpenBillPrintModal] =
    useState<boolean>(false);
  const [isOpenRouteStatement, setIsOpenRouteStatement] =
    useState<boolean>(false);
  const [isOpenUploadCheque, setIsOpenUploadCheque] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  const currentDate = convertDeliveryDateStringToDate(datePicker);
  const [routes, mutateRoutes] = SWRFetchData(
    getAdminApiUrl(companyId, `/routes?day=${days[currentDate.getDay()]}`),
  );

  // Printing Refs
  const invoicePrint: any = useRef();
  const allOrdersInvoicePrint: any = useRef();
  const billPrint: any = useRef();
  const weeklyPrint: any = useRef();
  // Reset display data
  useEffect(() => {
    if (clientOrders.length === 0) {
      setSelectedOrders([]);
    }
  }, [clientOrders]);

  useEffect(() => {
    if (datePicker) {
      mutateRoutes();
    }
  }, [datePicker]);

  const handleCloseActionsAnchor = () => {
    setActionButtonAnchor(null);
  };

  const handleCloseStatementAnchor = () => {
    setStatementAnchor(null);
  };

  const handleInvoicePrint = useReactToPrint({
    content: () => invoicePrint.current,
  });

  const handleAllOrdersInvoicePrint = useReactToPrint({
    content: () => allOrdersInvoicePrint.current,
  });

  const handleBillPrint = useReactToPrint({
    content: () => billPrint.current,
  });

  const handleWeeklyPrint = useReactToPrint({
    content: () => weeklyPrint.current,
  });

  const handleSelectOrder = (e: any, targetOrder: Order) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectOrders(targetOrder, selectedOrders, setSelectedOrders);
  };

  const handleSelectAll = () => {
    onSelectAllOrders(selectedOrders, clientOrders, setSelectedOrders);
  };

  const onUpdateOrderUI = (updatedOrder: Order) => {
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
      return order.paymentStatus === PaymentStatus.Unpaid;
    });

    setBaseClientOrders(newBaseOrderList);
    setClientOrders(newOrderList);
    setUnpaidOrders(newUnpaidOrders);
  };

  const handleDeleteSelectedOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        getAdminApiUrl(companyId, '/clients/orders'),
        {
          data: {
            orderList: selectedOrders,
          },
        },
      );

      showNotification('success', response.data.message);
      setIsLoading(false);
      setSelectedOrders([]);
    } catch (error: any) {
      console.log('Fail to delete orders: ', error);
      showNotification('error', 'Fail to delete orders: ' + error);
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    status: ORDER_STATUS | PaymentStatus,
    type: 'fulfill' | 'payment' = 'fulfill',
  ): Promise<void> => {
    setIsLoading(true);

    try {
      // const response = await axios.put(
      //   getAdminApiUrl(companyId, '/orders/status'),
      //   {
      //     status,
      //     updatedOrderIds,
      //   },
      // );
      await updateStatus(
        companyId,
        status,
        selectedOrders,
        showNotification,
        type,
      );

      setIsLoading(false);

      if (
        status === PaymentStatus.Paid &&
        clientValue?.clientName !== 'All Clients' &&
        clientValue?.preference?.paymentType === PAYMENT_TYPE.MONTHLY &&
        type === 'payment'
      ) {
        setIsOpenUploadCheque(true);
      }
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
      showNotification(
        'error',
        'Something went wrong. Please try again later - ERROR: ' +
          (error?.response?.data?.error || error),
      );
      setIsLoading(false);
    }
  };

  const handleSendInvoice = async (
    email: string = clientValue?.email || '',
  ) => {
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/sendInvoicePdf'),
        {
          client: { ...clientValue, email },
          orders: selectedOrders.length > 0 ? selectedOrders : clientOrders,
          endDate: dateRange[1],
        },
      );

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
        disabled={
          clientValue?.clientName === 'All Clients' ||
          clientOrders.length === 0 ||
          isFetching
        }
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
        {/* <MenuItem onClick={() => setIsOpenUploadChequeModal(true)}>
          Upload Cheque
        </MenuItem> */}
        <Divider />
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
          onClick={() => {
            handleAllOrdersInvoicePrint();
            handleCloseStatementAnchor();
          }}
        >
          Print (All Orders)
        </MenuItem>
        <MenuItem
          disabled={!clientValue?.email || false}
          onClick={async () => {
            setIsOpenEditEmail(true);
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
        <ListSubheader>Fulfillment Status</ListSubheader>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.DELIVERED);
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Mark as fulfilled</Typography>
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
            <Typography>Mark as unfulfilled</Typography>
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
        <Divider />
        <ListSubheader>Payment Status</ListSubheader>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(PaymentStatus.Paid, 'payment');
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Mark as paid</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(PaymentStatus.Unpaid, 'payment');
            handleCloseActionsAnchor();
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <MoneyOffOutlined sx={{ color: errorColor }} />
            <Typography>Mark as unpaid</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );
  return (
    <>
      <UploadChequeModal
        open={isOpenUploadCheque}
        onClose={() => setIsOpenUploadCheque(false)}
        showNotification={showNotification}
        year={dateRange[0].getFullYear().toString()}
        // month={dateRange[0].getMonth() + 1}
        client={clientValue}
      />
      <LoadingModal open={isLoading} />
      <EditEmail
        open={isOpenEditEmail}
        onClose={() => setIsOpenEditEmail(false)}
        sendInvoice={handleSendInvoice}
        email={clientValue?.email || ''}
        showNotification={showNotification}
        userId={clientValue?.id || -1}
      />
      {clientValue?.clientName !== 'All Clients' && (
        <div style={{ display: 'none' }}>
          <InvoicePrint
            client={clientValue}
            orders={selectedOrders.length > 0 ? selectedOrders : clientOrders}
            endDate={dateRange[1]}
            ref={invoicePrint}
          />
          <InvoicePrint
            client={clientValue}
            orders={selectedOrders.length > 0 ? selectedOrders : clientOrders}
            endDate={dateRange[1]}
            ref={allOrdersInvoicePrint}
            isPrintComplete
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
        <Grid item xs={6} md={2} textAlign="right">
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

        <Grid item xs={6} md={2} textAlign="right">
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
      )}
    </>
  );
}
