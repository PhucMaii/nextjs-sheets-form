/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import SelectDateRange from '../components/Select/SelectDateRange';
import { generateListOfDateString, generateMonthRange } from '@/app/utils/time';
import KPICard from '../components/Overview/KPICard';
import PaidIcon from '@mui/icons-material/Paid';
import { CardStyled } from '../components/OverviewCard/styled';
import Image from 'next/image';
import { CheckIcon, FilterIcon, Nfc } from 'lucide-react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AreaChart from '../components/Charts/AreaChart';
import { ShadowSection } from '../reports/styled';
import TransactionsTable from '../components/Tables/TransactionsTable';
import CardUsedByTable from '../components/Tables/CardUsedByTable';
import AddIcon from '@mui/icons-material/Add';
import AddPaymentMethod from '../components/Modals/add/AddPaymentMethod';
import useNotification from '@/hooks/useNotification';
import { fetchApi, SWRFetchData } from '@/app/utils/db';
import {
  PAYMENT_METHOD_TYPE,
  VIEW_TYPE,
  getAdminApiUrl,
} from '@/app/utils/enum';
import { IExpense, IPaymentMethod, IVendor } from '@/app/utils/type';
import PaymentsIcon from '@mui/icons-material/Payments';
import ErrorComponent from '../components/ErrorComponent';
import { normalizeDate } from '@/pages/api/utils/date';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditPaymentMethod from '../components/Modals/edit/EditPaymentMethod';
import axios from 'axios';
import DeleteModal from '../components/Modals/delete/DeleteModal';
import { useUpdateExpenseStatus } from '@/hooks/update/useUpdateExpenseStatus';
import LoadingModal from '../components/Modals/LoadingModal';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { error, errorBackground, errorColor } from '@/theme/color';
import moment from 'moment';

const SpendingItem = ({
  item,
  transactions,
}: {
  item: any;
  transactions: any;
}) => {
  const color = blueGrey[700];

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
      sx={{
        borderLeft: `5px solid ${blueGrey[700]}`,
        backgroundColor: '#f8fafc',
        borderRadius: '0 8px 8px 0',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f1f5f9',
          transform: 'translateX(4px)',
        },
      }}
    >
      <Typography variant="body1" fontWeight="600" color={blueGrey[700]}>
        {item[0]}
      </Typography>
      <Box textAlign="right">
        <Typography variant="body1" fontWeight="bold" color={blueGrey[800]}>
          {`$${item[1]?.toFixed(2)}`}
        </Typography>
        <Typography variant="caption" color={blueGrey[700]} fontWeight="600">
          {`${((item[1] / transactions?.overview?.totalSpent) * 100)?.toFixed(2)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default function CardManagement() {
  const { companyId }: any = useParams();
  const router = useRouter();

  const [filterAnchorEl, setFilterAnchorEl] = useState<any>(null);
  const isOpenFilter = Boolean(filterAnchorEl);
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  // const [displayedTransactions, setDisplayedTransactions] = useState<IExpense[]>([]);
  const [selectedViewObj, setSelectedViewObj] = useState<any>({
    type: VIEW_TYPE.ALL,
    id: 0,
  });
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentMethod, setCurrentMethod] = useState<
    IPaymentMethod | any | null
  >(null);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [openModal, setOpenModal] = useState<any>({
    addModal: false,
    editModal: false,
    deleteModal: false,
  });
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<IExpense[]>([]);
  // const [isOpenAddNewMethod, setIsOpenAddNewMethod] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const paramStartDate = searchParams?.get('startDate');
  const paramEndDate = searchParams?.get('endDate');
  const paramsViewType = searchParams?.get('viewType');
  const paramsViewId = searchParams?.get('viewId');

  const { showNotification, NotificationComp } = useNotification();
  const {
    handleUpdateStatus,
    UpdateExpenseStatusComp,
    isUpdating,
    Actions,
    AddExpenseButton,
    // AddExpenseModal,
  } = useUpdateExpenseStatus(showNotification, selectedExpenses);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  // Data Fetching
  const [transactions] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/expenses?startDate=${dateRange[0]}&endDate=${dateRange[1]}&id=${selectedViewObj.id}&type=${selectedViewObj.type}`,
    ),
  );

  const [adminsAndDriversRes] = SWRFetchData(
    getAdminApiUrl(companyId, '/adminsAndDrivers'),
  );

  const listOfDateString = useMemo(() => {
    const normalizedStartDate = normalizeDate(new Date(dateRange[0]));
    const normalizedEndDate = normalizeDate(new Date(dateRange[1]));
    const dateStringList = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    return dateStringList;
  }, [dateRange]);

  const totalExpense = useMemo(() => {
    if (!transactions) {
      return 0;
    }

    return transactions?.data?.reduce((acc: number, transaction: IExpense) => {
      return acc + transaction.amount;
    }, 0);
  }, [transactions]);

  const mostUsedMethod = useMemo(() => {
    if (!transactions) {
      return {};
    }

    if (transactions?.data.length === 0) {
      return {};
    }

    const mostUsed = transactions?.data?.reduce(
      (acc: any, transaction: IExpense) => {
        if (!acc[transaction.spentBy]) {
          acc[transaction.spentBy] = { amount: transaction.amount, count: 1 };
          return acc;
        }

        acc[transaction.spentBy].amount += transaction.amount;
        acc[transaction.spentBy].count += 1;
        return acc;
      },
      {},
    );

    return mostUsed;
  }, [transactions?.data]);

  const displayedTransactions = useMemo(() => {
    if (filterStatus === 'All') {
      return transactions?.data;
    }

    if (filterStatus === 'Unpaid') {
      return transactions?.data.filter(
        (transaction: IExpense) => transaction.status === 'Unpaid',
      );
    }

    if (filterStatus === 'Paid') {
      return transactions?.data.filter(
        (transaction: IExpense) => transaction.status === 'Paid',
      );
    }

    return transactions?.data;
  }, [transactions?.data, filterStatus]);

  useEffect(() => {
    if (selectedViewObj.id !== -1) {
      setCurrentMethod(getPaymentMethod());
    }
  }, [selectedViewObj]);

  useEffect(() => {
    if (adminsAndDriversRes) {
      setAdminsAndDrivers(adminsAndDriversRes?.data);
    }
  }, [adminsAndDriversRes]);

  useEffect(() => {
    if (companyId) {
      fetchPaymentMethods();
      fetchVendors();
    }
  }, [companyId]);

  useEffect(() => {
    if (paramsViewType || paramsViewId) {
      // const selectedType = 
      setSelectedViewObj({
        ...selectedViewObj,
        id: Number(paramsViewId) || selectedViewObj.id,
        type: paramsViewType || selectedViewObj.type,
      });
    }
  }, [paramsViewType, paramsViewId]);

  console.log('selectedViewObj', selectedViewObj);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (selectedViewObj) {
      params.set('viewType', selectedViewObj.type);
      params.set('viewId', selectedViewObj.id);
    } else {
      params.delete('viewType');
      params.delete('viewId');
    }

    router.replace(`/admin/${companyId}/cards?${params.toString()}`, {
      scroll: false,
    });
  }, [selectedViewObj]);

  useEffect(() => {
    if (paramStartDate || paramEndDate) {
      setDateRange([
        new Date(paramStartDate || ''),
        new Date(paramEndDate || ''),
      ]);
    } else {
      setDateRange(generateMonthRange());
    }
  }, [paramStartDate, paramEndDate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (dateRange[0] || dateRange[1]) {
      params.set('startDate', dateRange[0]);
      params.set('endDate', dateRange[1]);
    } else {
      params.delete('startDate');
      params.delete('endDate');
    }

    router.replace(`/admin/${companyId}/cards?${params.toString()}`, {
      scroll: false,
    });
  }, [dateRange]);

  const fetchPaymentMethods = async () => {
    const paymentMethods: any = await fetchApi(
      getAdminApiUrl(companyId, '/paymentMethods'),
      showNotification,
    );
    setPaymentMethods(paymentMethods);
  };

  const fetchVendors = async () => {
    const vendors: any = await fetchApi(
      getAdminApiUrl(companyId, '/vendors'),
      showNotification,
    );
    setVendors(vendors);
  };

  // useEffect(() => {
  //   fetchAdminsAndDrivers();
  // }, []);

  // const fetchAdminsAndDrivers = async () => {
  //   const users: any = await getAdminsAndDrivers(showNotification);
  //   setAdminsAndDrivers(users);
  // };

  const getPaymentMethod = () => {
    if (selectedViewObj.id === -1) {
      return null;
    }

    if (selectedViewObj.type === VIEW_TYPE.ALL) {
      return {
        id: -1,
        name: 'OVERVIEW',
        type: PAYMENT_METHOD_TYPE.CASH,
        transactions: [],
        balance: 0,
        createdAt: '',
        createdBy: '',
        updatedBy: null,
        updatedAt: null,
      };
    }

    if (selectedViewObj.type === VIEW_TYPE.PAYMENT_METHOD) {
      return paymentMethods?.find(
        (method: IPaymentMethod) => method.id === selectedViewObj.id,
      );
    }

    if (
      selectedViewObj.type === VIEW_TYPE.CUSTOM_PURCHASED ||
      selectedViewObj.type === VIEW_TYPE.STOCK_PURCHASED ||
      selectedViewObj.type === VIEW_TYPE.FIXED_TRANSACTION
    ) {
      return {
        id: -1,
        name:
          selectedViewObj.type === VIEW_TYPE.CUSTOM_PURCHASED
            ? 'Custom Purchased'
            : selectedViewObj.type === VIEW_TYPE.STOCK_PURCHASED
              ? 'Stock Purchased'
              : 'Fixed Transaction',
        type: selectedViewObj.type,
        transactions: [],
        balance: 0,
        createdAt: '',
        createdBy: '',
        updatedBy: null,
        updatedAt: null,
      };
    }
    const selectedVendor = vendors?.find(
      (vendor: IVendor) => vendor.id === selectedViewObj.id,
    );
    return {
      id: -1,
      name: selectedVendor?.name,
      type: PAYMENT_METHOD_TYPE.CASH,
      transactions: [],
      balance: 0,
      createdAt: '',
      createdBy: '',
      updatedBy: null,
      updatedAt: null,
    };
  };

  const handleDeleteMethod = async (targetMethod: IPaymentMethod) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(
          companyId,
          `/paymentMethods?methodId=${targetMethod.id}`,
        ),
      );

      if (response.data.error) {
        showNotification(
          'error',
          'Fail to delete payment method. Please try again later.',
        );
        return;
      }

      // Update Real Data
      setSelectedViewObj({
        id: -1,
        type: null,
      });
      setCurrentMethod(null);

      showNotification('success', 'Payment method deleted successfully.');
      setOpenModal({ ...openModal, deleteModal: false });
      fetchPaymentMethods();
    } catch (error: any) {
      console.log('Fail to delete payment method: ', error);
      showNotification(
        'error',
        'Fail to delete payment method. Please try again later.',
      );
    }
  };

  const handleSelectAll = () => {
    if (!transactions) {
      return;
    }

    if (selectedExpenses.length === transactions?.data.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(transactions?.data);
    }
  };

  const handleSelectExpense = (e: any, targetExpense: IExpense) => {
    e.stopPropagation();
    e.preventDefault();
    const selectedExpense = selectedExpenses.find((expense: IExpense) => {
      return expense.id === targetExpense.id;
    });

    if (selectedExpense) {
      const newSelectedExpense = selectedExpenses.filter(
        (expense: IExpense) => {
          return expense.id !== targetExpense.id;
        },
      );
      setSelectedExpenses(newSelectedExpense);
    } else {
      setSelectedExpenses([...selectedExpenses, targetExpense]);
    }
  };

  return (
    <Sidebar>
      {/* {AddExpenseModal} */}
      {UpdateExpenseStatusComp}
      <LoadingModal open={isUpdating} />
      {NotificationComp}
      <AddPaymentMethod
        open={openModal.addModal}
        onClose={() => setOpenModal({ ...openModal, addModal: false })}
        showNotification={showNotification}
      />

      <EditPaymentMethod
        open={openModal.editModal}
        onClose={() => setOpenModal({ ...openModal, editModal: false })}
        showNotification={showNotification}
        paymentMethod={currentMethod}
        setCurrentPaymentMethod={setCurrentMethod}
        mutateMethod={fetchPaymentMethods}
      />

      <DeleteModal
        open={openModal.deleteModal}
        handleCloseModal={() =>
          setOpenModal({ ...openModal, deleteModal: false })
        }
        targetObj={currentMethod}
        handleDelete={(_e: any, targetMethod: IPaymentMethod) =>
          handleDeleteMethod(targetMethod)
        }
      />

      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        height="100vh"
        overflow="auto"
        pb={2}
      >
        {/* Header */}
        <Box
          display="flex"
          flexDirection={smDown ? 'column' : 'row'}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => setOpenModal({ ...openModal, addModal: true })}
            >
              <AddIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" color={blueGrey[800]}>
              Cards
            </Typography>

            <Box display="flex" alignItems="center">
              <IconButton
                color="primary"
                onClick={() => setOpenModal({ ...openModal, editModal: true })}
                disabled={
                  selectedViewObj.id === -1 ||
                  selectedViewObj.type === VIEW_TYPE.VENDOR ||
                  selectedViewObj.type === VIEW_TYPE.ALL
                }
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() =>
                  setOpenModal({ ...openModal, deleteModal: true })
                }
                disabled={
                  selectedViewObj.id === -1 ||
                  selectedViewObj.type === VIEW_TYPE.VENDOR ||
                  selectedViewObj.type === VIEW_TYPE.CUSTOM_PURCHASED ||
                  selectedViewObj.type === VIEW_TYPE.STOCK_PURCHASED ||
                  selectedViewObj.type === VIEW_TYPE.ALL
                }
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Box
            display="flex"
            flexDirection={smDown ? 'row-reverse' : 'row'}
            alignItems="center"
            gap={1}
          >
            <Select
              value={JSON.stringify(selectedViewObj)}
              onChange={(e) => setSelectedViewObj(JSON.parse(e.target.value))}
              size="small"
            >
              <MenuItem disabled value={JSON.stringify({ type: null, id: -1 })}>
                -- Choose Payment Method --
              </MenuItem>
              <MenuItem value={JSON.stringify({ type: VIEW_TYPE.ALL, id: 0 })}>
                All
              </MenuItem>
              <ListSubheader>Payment Methods</ListSubheader>
              {paymentMethods &&
                paymentMethods?.map((method: IPaymentMethod) => (
                  <MenuItem
                    key={method.id}
                    value={JSON.stringify({
                      type: VIEW_TYPE.PAYMENT_METHOD,
                      id: method.id,
                    })}
                  >
                    {method.name}
                  </MenuItem>
                ))}
              <Divider />
              <ListSubheader>Transaction Type</ListSubheader>
              <MenuItem
                value={JSON.stringify({
                  type: VIEW_TYPE.STOCK_PURCHASED,
                  id: 1,
                })}
              >
                Stock Purchased
              </MenuItem>
              <MenuItem
                value={JSON.stringify({
                  type: VIEW_TYPE.FIXED_TRANSACTION,
                  id: 1,
                })}
              >
                Fixed Transaction
              </MenuItem>
              <MenuItem
                value={JSON.stringify({
                  type: VIEW_TYPE.CUSTOM_PURCHASED,
                  id: 1,
                })}
              >
                Custom Purchased
              </MenuItem>
              <Divider />
              <ListSubheader>Vendors</ListSubheader>
              {vendors &&
                vendors?.map((vendor: IVendor) => (
                  <MenuItem
                    key={vendor.id}
                    value={JSON.stringify({
                      type: VIEW_TYPE.VENDOR,
                      id: vendor.id,
                    })}
                  >
                    {vendor.name}
                  </MenuItem>
                ))}
            </Select>
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Box>
        </Box>

        {selectedViewObj.id === -1 ? (
          <ErrorComponent errorText="Please select payment method" />
        ) : selectedViewObj.type === VIEW_TYPE.VENDOR ? (
          // Vendor Overview Dashboard
          <>
            <Grid container spacing={2}>
              {/* Vendor Header */}
              <Grid item xs={12}>
                {/* <Box
                  sx={{
                    // background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    borderRadius: 3,
                    p: 4,
                    color: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    // boxShadow: '0 8px 32px rgba(25, 118, 210, 0.2)',
                    border: `1px solid ${blueGrey[200]}`,
                  }}
                > */}
                <Typography variant="h4" fontWeight="bold" my={1}>
                  {currentMethod?.name} Vendor Analysis
                </Typography>
                {/* </Box> */}
              </Grid>

              {/* Overview Cards - Main Metrics */}
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Total Spent"
                  value={`$${transactions?.overview?.totalSpent?.toFixed(2) || 0}`}
                  icon={<PaidIcon />}
                  color="primary"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Unpaid Amount"
                  value={`$${transactions?.overview?.unpaidAmount?.toFixed(2) || 0}`}
                  icon={<AccountBalanceWalletIcon />}
                  color="warning"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Paid Amount"
                  value={`$${transactions?.overview?.paidAmount?.toFixed(2) || 0}`}
                  icon={<PaymentsIcon />}
                  color="success"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Overdue Amount"
                  value={`$${transactions?.overview?.overdueAmount?.toFixed(2) || 0}`}
                  icon={<AccountBalanceWalletIcon />}
                  color="error"
                  variant="gradient"
                  subtitle={`Latest transaction on: ${transactions?.overview?.overdueExpenses[transactions?.overview?.overdueExpenses.length - 1]?.date || ''}`}
                />
              </Grid>

              {/* Charts and Analysis Section */}
              <Grid item xs={12} md={8}>
                <ShadowSection>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={2}
                  >
                    Spending Trend Analysis
                  </Typography>
                  <AreaChart
                    timeSeries={listOfDateString}
                    thisMonthData={transactions?.chartData || []}
                  />
                </ShadowSection>
              </Grid>

              <Grid item xs={12} md={4}>
                <ShadowSection>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={2}
                  >
                    Payment Status Breakdown
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      p={2.5}
                      sx={{
                        backgroundColor: '#e8f5e8',
                        borderRadius: 2,
                        border: '1px solid #c8e6c9',
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="600"
                        color="#2e7d32"
                      >
                        Paid
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="#388e3c"
                      >
                        {transactions?.overview?.paidPercentage}%
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      p={2.5}
                      sx={{
                        backgroundColor: errorBackground,
                        borderRadius: 2,
                        border: `1px solid ${error['main']}`,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="600"
                        color="error"
                      >
                        Unpaid
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="error">
                        {transactions?.overview?.unpaidPercentage}%
                      </Typography>
                    </Box>
                  </Box>
                </ShadowSection>
              </Grid>

              {/* Category Analysis */}
              <Grid item xs={12}>
                <ShadowSection>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={2}
                  >
                    Top Spending Categories
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {transactions?.overview?.topSpendingItems.map(
                      (item: any, index: number) => (
                        <SpendingItem
                          key={index}
                          item={item}
                          transactions={transactions}
                        />
                      ),
                    )}
                  </Box>
                </ShadowSection>
              </Grid>

              {/* Payment Timeline */}
              {/* <Grid item xs={12} md={6}>
                <ShadowSection>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={2}
                  >
                    Payment Timeline Insights
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box
                      p={3}
                      sx={{
                        backgroundColor: '#e3f2fd',
                        borderRadius: 2,
                        border: '1px solid #bbdefb',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="600"
                        color="#1565c0"
                        mb={0.5}
                      >
                        Average Payment Delay
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#1976d2"
                      >
                        {transactions?.overview?.avgPaymentDelay?.toFixed(2)}{' '}
                        days
                      </Typography>
                    </Box>
                    <Box
                      p={3}
                      sx={{
                        backgroundColor: '#fff3e0',
                        borderRadius: 2,
                        border: '1px solid #ffcc02',
                        boxShadow: '0 2px 8px rgba(245, 124, 0, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="600"
                        color="#e65100"
                        mb={0.5}
                      >
                        Longest Outstanding
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#f57c00"
                      >
                        {transactions?.overview?.longestPaymentDelay?.toFixed(
                          2,
                        )}{' '}
                        days
                      </Typography>
                    </Box>
                    <Box
                      p={3}
                      sx={{
                        backgroundColor: '#e8f5e8',
                        borderRadius: 2,
                        border: '1px solid #c8e6c9',
                        boxShadow: '0 2px 8px rgba(56, 142, 60, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="600"
                        color="#2e7d32"
                        mb={0.5}
                      >
                        Fastest Payment
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#388e3c"
                      >
                        {transactions?.overview?.shortestPaymentDelay?.toFixed(
                          2,
                        )}{' '}
                        days
                      </Typography>
                    </Box>
                  </Box>
                </ShadowSection>
              </Grid> */}

              {/* Action Items */}
              {/* <Grid item xs={12}>
                <ShadowSection>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={3}
                  >
                    Action Items & Recommendations
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      {transactions?.overview?.overdueExpenses.length > 0 && (
                        <Box
                          p={3}
                          sx={{
                            backgroundColor: '#ffebee',
                            borderRadius: 2,
                            border: '1px solid #ffcdd2',
                            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-2px)' },
                          }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#d32f2f',
                              }}
                            />
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="#c62828"
                            >
                              Urgent: Overdue Payments
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="#7f1d1d" mb={1}>
                            {transactions?.overview?.overdueExpenses.length}{' '}
                            payments are overdue. Total amount: $
                            {transactions?.overview?.overdueAmount?.toFixed(2)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="#d32f2f"
                            fontWeight="600"
                          >
                            Oldest overdue:{' '}
                            {Math.abs(
                              moment(
                                transactions?.overview?.overdueExpenses[
                                  transactions?.overview?.overdueExpenses
                                    .length - 1
                                ]?.date,
                              ).diff(moment(), 'days'),
                            )}{' '}
                            days
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box
                        p={3}
                        sx={{
                          backgroundColor: '#fff3e0',
                          borderRadius: 2,
                          border: '1px solid #ffcc02',
                          boxShadow: '0 4px 12px rgba(245, 124, 0, 0.15)',
                          transition: 'transform 0.2s ease',
                          '&:hover': { transform: 'translateY(-2px)' },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#f57c00',
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="#e65100"
                          >
                            Review: High Spending
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="#bf360c" mb={1}>
                          {transactions?.overview?.thisMonthExpensesPercentage}%
                          increase in spending this month
                        </Typography>
                        <Typography
                          variant="caption"
                          color="#f57c00"
                          fontWeight="600"
                        >
                          Consider budget review
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box
                        p={3}
                        sx={{
                          backgroundColor: '#e8f5e8',
                          borderRadius: 2,
                          border: '1px solid #c8e6c9',
                          boxShadow: '0 4px 12px rgba(56, 142, 60, 0.15)',
                          transition: 'transform 0.2s ease',
                          '&:hover': { transform: 'translateY(-2px)' },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#388e3c',
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="#2e7d32"
                          >
                            Opportunity: Bulk Discount
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="#1b5e20" mb={1}>
                          Regular high-volume purchases detected
                        </Typography>
                        <Typography
                          variant="caption"
                          color="#388e3c"
                          fontWeight="600"
                        >
                          Negotiate better rates
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </ShadowSection>
              </Grid> */}

              {/* Recent Transactions Table */}
              <Grid item xs={12}>
                <ShadowSection>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}
                    mb={2}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={blueGrey[800]}
                    >
                      Recent Transactions with {currentMethod?.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      {AddExpenseButton}
                      {Actions}
                      <IconButton
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                      >
                        <FilterIcon
                          style={{
                            width: 20,
                            height: 20,
                            color: blueGrey[800],
                          }}
                        />
                      </IconButton>
                      <Menu
                        anchorEl={filterAnchorEl}
                        open={isOpenFilter}
                        onClose={() => setFilterAnchorEl(null)}
                        sx={{
                          '& .MuiList-root': {
                            width: 150,
                          },
                        }}
                      >
                        <ListSubheader>Filter</ListSubheader>
                        <MenuItem
                          onClick={() => setFilterStatus('All')}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {filterStatus === 'All' && (
                            <CheckIcon
                              style={{
                                width: 20,
                                height: 20,
                                color: blueGrey[800],
                              }}
                            />
                          )}
                          <Typography>All</Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setFilterStatus('Unpaid')}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {filterStatus === 'Unpaid' && (
                            <CheckIcon
                              style={{
                                width: 20,
                                height: 20,
                                color: blueGrey[800],
                              }}
                            />
                          )}
                          <Typography>Unpaid</Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setFilterStatus('Paid')}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {filterStatus === 'Paid' && (
                            <CheckIcon
                              style={{
                                width: 20,
                                height: 20,
                                color: blueGrey[800],
                              }}
                            />
                          )}
                          <Typography>Paid</Typography>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>

                  <TransactionsTable
                    transactions={displayedTransactions || []}
                    handleUpdateStatus={handleUpdateStatus}
                    showNotification={showNotification}
                    selectedExpense={selectedExpenses}
                    handleSelectExpense={handleSelectExpense}
                    handleSelectAll={handleSelectAll}
                    adminsAndDrivers={adminsAndDrivers}
                  />
                </ShadowSection>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Grid container spacing={2} sx={{ height: 200 }}>
              <Grid item xs={12} md={8}>
                <CardStyled
                  sx={{
                    width: '100%',
                    height: '100%',
                    background:
                      currentMethod?.type === PAYMENT_METHOD_TYPE.CASH
                        ? 'linear-gradient(to right, rgb(34, 197, 94), rgb(21, 128, 61))'
                        : currentMethod?.type === PAYMENT_METHOD_TYPE.CHEQUE
                          ? 'linear-gradient(to right, rgb(202, 138, 4), rgb(220, 38, 38))'
                          : 'radial-gradient(at right center, rgb(56, 189, 248), rgb(49, 46, 129))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2 }}
                  >
                    <Typography variant="h5" color="white">
                      {currentMethod?.name}
                    </Typography>
                    {currentMethod?.type === PAYMENT_METHOD_TYPE.CASH ? (
                      <PaymentsIcon
                        style={{ color: 'white', width: 50, height: 50 }}
                      />
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        flexDirection="row"
                      >
                        <Image
                          src="/visa-image.png"
                          alt="expense"
                          width={150}
                          height={50}
                        />
                        <Typography
                          variant="body1"
                          color="white"
                          fontWeight={500}
                        >
                          {currentMethod?.type}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ px: 8 }}
                  >
                    {currentMethod?.type !== PAYMENT_METHOD_TYPE.CASH &&
                      currentMethod?.type !== PAYMENT_METHOD_TYPE.CHEQUE && (
                        <Nfc
                          style={{ color: 'white', width: 50, height: 50 }}
                        />
                      )}
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2 }}
                  >
                    <Typography variant="body1" color="white">
                      {currentMethod?.createdBy}
                    </Typography>
                    <Typography variant="body1" color="white">
                      {currentMethod?.createdAt}
                    </Typography>
                  </Box>
                </CardStyled>
              </Grid>
              {/* Overivew Cards */}
              <Grid container item xs={12} md={4} spacing={2}>
                <Grid item xs={12}>
                  <KPICard
                    title="Expense"
                    value={totalExpense?.toFixed(2)}
                    icon={<PaidIcon />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12}>
                  <KPICard
                    title="Transactions"
                    value={transactions?.data?.length || 0}
                    icon={<AccountBalanceWalletIcon />}
                    color="info"
                  />
                </Grid>
              </Grid>

              <Grid item xs={12}>
                {/* Expense Chart */}
                <ShadowSection>
                  <AreaChart
                    timeSeries={listOfDateString}
                    thisMonthData={transactions?.chartData || []}
                  />
                </ShadowSection>
              </Grid>
              <Grid item xs={12} md={8}>
                <ShadowSection>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}
                    mb={2}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={blueGrey[800]}
                      // mb={2}
                    >
                      Recent Transactions
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      {AddExpenseButton}
                      {Actions}
                      <IconButton
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                      >
                        <FilterIcon
                          style={{
                            width: 20,
                            height: 20,
                            color: blueGrey[800],
                          }}
                        />
                      </IconButton>
                      <Menu
                        anchorEl={filterAnchorEl}
                        open={isOpenFilter}
                        onClose={() => setFilterAnchorEl(null)}
                        sx={{
                          '& .MuiList-root': {
                            width: 150,
                          },
                        }}
                      >
                        <ListSubheader>Filter</ListSubheader>
                        <MenuItem
                          onClick={() => setFilterStatus('All')}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {filterStatus === 'All' && (
                            <CheckIcon
                              style={{
                                width: 20,
                                height: 20,
                                color: blueGrey[800],
                              }}
                            />
                          )}
                          <Typography>All</Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setFilterStatus('Unpaid')}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {filterStatus === 'Unpaid' && (
                            <CheckIcon
                              style={{
                                width: 20,
                                height: 20,
                                color: blueGrey[800],
                              }}
                            />
                          )}
                          <Typography>Unpaid</Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setFilterStatus('Paid')}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {filterStatus === 'Paid' && (
                            <CheckIcon
                              style={{
                                width: 20,
                                height: 20,
                                color: blueGrey[800],
                              }}
                            />
                          )}
                          <Typography>Paid</Typography>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>

                  {/* Recent Transactions */}
                  <TransactionsTable
                    transactions={displayedTransactions || []}
                    handleUpdateStatus={handleUpdateStatus}
                    showNotification={showNotification}
                    selectedExpense={selectedExpenses}
                    handleSelectExpense={handleSelectExpense}
                    handleSelectAll={handleSelectAll}
                    adminsAndDrivers={adminsAndDrivers}
                    // Actions={Actions}
                  />
                </ShadowSection>
              </Grid>
              <Grid item xs={12} md={4}>
                <ShadowSection>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={2}
                  >
                    Who used it most?
                  </Typography>

                  {/* Who used it most */}
                  <CardUsedByTable data={mostUsedMethod} />
                </ShadowSection>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Sidebar>
  );
}
