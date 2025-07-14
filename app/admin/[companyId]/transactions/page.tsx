'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Grid,
  ListSubheader,
  IconButton,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { ShadowSection } from '../reports/styled';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import TransactionsTable from '../components/Tables/TransactionsTable';
import useNotification from '@/hooks/useNotification';
import { IExpense } from '@/app/utils/type';
import useDebounce from '@/hooks/useDebounce';
import TransactionOverview from '../components/Overview/TransactionOverview';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { CheckIcon } from 'lucide-react';
import LoadingModal from '../components/Modals/LoadingModal';
import { useUpdateExpenseStatus } from '@/hooks/update/useUpdateExpenseStatus';
import { useParams } from 'next/navigation';
import { FilterIcon } from 'lucide-react';

export default function Transactions() {
  const { companyId }: any = useParams();
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [baseTransactions, setBaseTransactions] = useState<IExpense[]>([]);
  const [currentMethodId, setCurrentMethodId] = useState<number>(-1);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterAnchorEl, setFilterAnchorEl] = useState<any>(null);
  const isOpenFilter = Boolean(filterAnchorEl);
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
  const [paymentMethods] = SWRFetchData(
    getAdminApiUrl(companyId, '/paymentMethods'),
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expenses, _mutateExpenses, isValidating] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/expenses?startDate=${dateRange[0]}&endDate=${dateRange[1]}&id=${currentMethodId}`,
    ),
  );
  const [adminsAndDriversRes] = SWRFetchData(
    getAdminApiUrl(companyId, '/adminsAndDrivers'),
  );

  // Combined filtering logic using useMemo
  const displayTransactions = useMemo(() => {
    let filtered = baseTransactions;

    // Apply search filter
    if (debouncedKeywords) {
      const searchLower = debouncedKeywords.toLowerCase();
      filtered = filtered.filter((transaction: IExpense) => {
        const searchableFields = [
          transaction.invoice,
          transaction?.vendors?.[0]?.vendorId?.toString(),
          transaction.spentBy,
          transaction.description,
        ];

        return searchableFields.some((field) => 
          field?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter((transaction: IExpense) => 
        transaction.status === filterStatus
      );
    }

    return filtered;
  }, [baseTransactions, debouncedKeywords, filterStatus]);

  useEffect(() => {
    if (expenses) {
      setIsLoading(false);
      initializeTransactions();
    } else if (!expenses && isValidating) {
      setIsLoading(true);
      setSelectedExpenses([]);
    }
  }, [expenses?.data, dateRange]);

  useEffect(() => {
    if (adminsAndDriversRes) {
      setAdminsAndDrivers(adminsAndDriversRes?.data);
    }
  }, [adminsAndDriversRes]);

  const initializeTransactions = () => {
    setBaseTransactions(expenses?.data || []);
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

  const handleSelectAll = () => {
    if (!expenses) {
      return;
    }

    if (selectedExpenses.length === displayTransactions.length && displayTransactions.length > 0) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(displayTransactions);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchKeywords('');
    setFilterStatus('All');
  };

  // Get filter summary text
  const getFilterSummary = () => {
    let summary = `Showing ${displayTransactions.length} of ${baseTransactions.length} transactions`;
    
    if (debouncedKeywords) {
      summary += ` matching "${debouncedKeywords}"`;
    }
    
    if (filterStatus !== 'All') {
      summary += ` with status "${filterStatus}"`;
    }
    
    return summary;
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
              placeholder="Search transactions by invoice, vendor, spent by, or description..."
              variant="filled"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid
            item
            xs={4}
            md={2}
            textAlign="center"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            {Actions}
            <Box>
              <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
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
                <ListSubheader>Filter by Status</ListSubheader>
                <MenuItem
                  onClick={() => {
                    setFilterStatus('All');
                    setFilterAnchorEl(null);
                  }}
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
                  onClick={() => {
                    setFilterStatus('Unpaid');
                    setFilterAnchorEl(null);
                  }}
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
                  onClick={() => {
                    setFilterStatus('Paid');
                    setFilterAnchorEl(null);
                  }}
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
          </Grid>
        </Grid>
        
        {/* Filter Summary and Clear Button */}
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {getFilterSummary()}
          </Typography>
          {(searchKeywords || filterStatus !== 'All') && (
            <Box>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Typography>
            </Box>
          )}
        </Box>
        
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
