'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  // Button,
  Grid,
  // Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/SelectDateRange';
import { ShadowSection } from '../reports/styled';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import TransactionsTable from '../components/Tables/TransactionsTable';
import useNotification from '@/hooks/useNotification';
import { IExpense } from '@/app/utils/type';
import useDebounce from '@/hooks/useDebounce';
import TransactionOverview from '../components/Overview/TransactionOverview';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import LoadingModal from '../components/Modals/LoadingModal';
import { useUpdateExpenseStatus } from '@/hooks/update/useUpdateExpenseStatus';

export default function Transactions() {
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [baseTransactions, setBaseTransactions] = useState<IExpense[]>([]);
  const [currentMethodId, setCurrentMethodId] = useState<number>(-1);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [displayTransactions, setDisplayTransactions] = useState<IExpense[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedExpenses, setSelectedExpenses] = useState<IExpense[]>([]);

  const { showNotification, NotificationComp } = useNotification();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const {
    handleUpdateStatus,
    // handleBulkUpdateStatus,
    UpdateExpenseStatusComp,
    isUpdating,
    Actions,
    AddExpenseModal,
  } = useUpdateExpenseStatus(showNotification, selectedExpenses);

  // Data Fetching
  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);
  const [transactions] = SWRFetchData(
    `${API_URL.ADMIN}/expenses?startDate=${dateRange[0]}&endDate=${dateRange[1]}&id=${currentMethodId}`,
  );
  const [adminsAndDriversRes] = SWRFetchData(
    `${API_URL.ADMIN}/adminsAndDrivers`,
  );

  useEffect(() => {
    if (transactions) {
      setIsLoading(false);
      initializeTransactions();
    } else {
      setIsLoading(true);
      setSelectedExpenses([]);
    }
  }, [transactions?.data, dateRange]);

  // console.log(displayTransactions, 'displayTransactions');

  useEffect(() => {
    if (debouncedKeywords) {
      const newTransactions = baseTransactions.filter((transaction: any) => {
        return (
          transaction.invoice === debouncedKeywords ||
          (transaction?.vendors
            ? transaction?.vendors[0]?.vendor?.name
                ?.toLowerCase()
                ?.includes(debouncedKeywords.toLowerCase())
            : false) ||
          transaction.spentBy
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase()) ||
          transaction.description
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase())
        );
      });
      setDisplayTransactions(newTransactions);
    } else {
      setDisplayTransactions(baseTransactions);
    }
  }, [debouncedKeywords, baseTransactions]);

  useEffect(() => {
    if (adminsAndDriversRes) {
      setAdminsAndDrivers(adminsAndDriversRes?.data);
    }
  }, [adminsAndDriversRes]);

  // useEffect(() => {
  //   fetchAdminsAndDrivers();
  // }, []);

  // const fetchAdminsAndDrivers = async () => {
  //   const users: any = await getAdminsAndDrivers(showNotification);
  //   setAdminsAndDrivers(users);
  // };

  const initializeTransactions = () => {
    setBaseTransactions(transactions?.data || []);
    setDisplayTransactions(transactions?.data || []);
  };

  const handleSelectExpense = (e: any, targetExpense: IExpense) => {
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

  const handleSelectAll = () => {
    if (!transactions) {
      return;
    }

    if (selectedExpenses.length === baseTransactions.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(baseTransactions);
    }
  };

  return (
    <Sidebar>
      {UpdateExpenseStatusComp}
      <LoadingModal open={isUpdating} />
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {AddExpenseModal}
        <Typography variant="h5" fontWeight="bold" color={blueGrey[800]}>
          Transactions
        </Typography>

        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>

      <TransactionOverview transactions={displayTransactions} />
      <ShadowSection>
        <Typography variant="h6" fontWeight="bold" color={blueGrey[800]}>
          Payment Method
        </Typography>
        <Select
          sx={{ mt: 2 }}
          value={currentMethodId}
          onChange={(e) => setCurrentMethodId(Number(e.target.value))}
          fullWidth
        >
          <MenuItem value={-1}>All</MenuItem>
          {paymentMethods?.data?.length > 0 &&
            paymentMethods?.data.map((method: any) => (
              <MenuItem key={method.id} value={method.id}>
                {method.name}
              </MenuItem>
            ))}
        </Select>
      </ShadowSection>

      <ShadowSection>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={8} md={10}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search Transaction..."
              variant="filled"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid item xs={4} md={2} textAlign="center">
            {Actions}
          </Grid>
        </Grid>
        {isLoading ? (
          <LoadingComponent />
        ) : (
          <TransactionsTable
            transactions={displayTransactions}
            handleUpdateStatus={handleUpdateStatus}
            showNotification={showNotification}
            selectedExpense={selectedExpenses || []}
            handleSelectExpense={handleSelectExpense}
            handleSelectAll={handleSelectAll}
            adminsAndDrivers={adminsAndDrivers}
          />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
