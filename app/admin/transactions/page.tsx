'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  Menu,
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DropdownItemContainer } from '../orders/styled';
import { primaryColor } from '@/theme/color';
import AddIcon from '@mui/icons-material/Add';
import AddExpense from '../components/Modals/add/AddExpense';
import useNotification from '@/hooks/useNotification';
import { IExpense } from '@/app/utils/type';
import useDebounce from '@/hooks/useDebounce';
import { handleSearch } from '@/app/utils/search';
import TransactionOverview from '../components/Overview/TransactionOverview';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

export default function Transactions() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  // const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [currentMethodId, setCurrentMethodId] = useState<number>(-1);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [displayTransactions, setDisplayTransactions] = useState<IExpense[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenAddExpense, setIsOpenAddExpense] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const { showNotification, NotificationComp } = useNotification();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  // Data Fetching
  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);
  const [transactions] = SWRFetchData(
    `${API_URL.ADMIN}/expenses?startDate=${dateRange[0]}&endDate=${dateRange[1]}&id=${currentMethodId}`,
  );

  useEffect(() => {
    if (!transactions) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setDisplayTransactions(transactions?.data || []);
    }
  }, [transactions, dateRange]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newTransactions = handleSearch(
        debouncedKeywords,
        transactions?.data,
        ['description', 'spentBy', 'invoice'],
      );
      setDisplayTransactions(newTransactions);
    } else {
      setDisplayTransactions(transactions?.data || []);
    }
  }, [debouncedKeywords]);

  const actions = (
    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
      <Button
        variant="outlined"
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowDownwardIcon fontSize="small" />
          <Typography fontWeight="medium">Actions</Typography>
        </Box>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={actionButtonAnchor}
        open={openDropdown}
        onClose={() => setActionButtonAnchor(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setIsOpenAddExpense(true);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <AddIcon sx={{ color: primaryColor }} />
            <Typography>Add Expense</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Sidebar>
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <AddExpense
          open={isOpenAddExpense}
          onClose={() => setIsOpenAddExpense(false)}
          showNotification={showNotification}
        />
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
            {actions}
          </Grid>
        </Grid>
        {isLoading ? (
          <LoadingComponent />
        ) : (
          <TransactionsTable
            transactions={displayTransactions}
            showNotification={showNotification}
          />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
