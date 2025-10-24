'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Chip,
  Stack,
  Paper,
  Divider,
  Button,
  InputAdornment,
} from '@mui/material';
import { blueGrey, blue } from '@mui/material/colors';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import TransactionsTable from '../components/Tables/TransactionsTable';
import useNotification from '@/hooks/useNotification';
import { IExpense } from '@/app/utils/type';
import useDebounce from '@/hooks/useDebounce';
import TransactionOverview from '../components/Overview/TransactionOverview';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import {
  CheckIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
  CalendarIcon,
} from 'lucide-react';
import LoadingModal from '../components/Modals/LoadingModal';
import { useUpdateExpenseStatus } from '@/hooks/update/useUpdateExpenseStatus';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getTransactionStatusColor } from '@/lib/statusColor';

export default function Transactions() {
  const { companyId }: any = useParams();
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [baseTransactions, setBaseTransactions] = useState<IExpense[]>([]);
  // const [currentMethodId, setCurrentMethodId] = useState<number>(-1);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterAnchorEl, setFilterAnchorEl] = useState<any>(null);
  const isOpenFilter = Boolean(filterAnchorEl);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedExpenses, setSelectedExpenses] = useState<IExpense[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const paramStartDate = searchParams?.get('startDate');
  const paramEndDate = searchParams?.get('endDate');
  const paramSearchKeywords = searchParams?.get('q');

  const { showNotification, NotificationComp } = useNotification();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const {
    handleUpdateStatus,
    UpdateExpenseStatusComp,
    isUpdating,
    Actions,
    AddExpenseButton,
    // AddExpenseModal,
  } = useUpdateExpenseStatus(showNotification, selectedExpenses);

  // Data Fetching
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expenses, _mutateExpenses, isValidating] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/expenses?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
    ),
  );
  const [adminsAndDriversRes] = SWRFetchData(
    getAdminApiUrl(companyId, '/adminsAndDrivers'),
  );

  // Combined filtering logic using useMemo
  const displayTransactions = useMemo(() => {
    let filtered = baseTransactions;

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
          field?.toLowerCase().includes(searchLower),
        );
      });
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(
        (transaction: IExpense) => transaction.status === filterStatus,
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

    router.replace(`/admin/${companyId}/transactions?${params.toString()}`, {
      scroll: false,
    });
  }, [dateRange]);

  useEffect(() => {
    if (paramSearchKeywords) {
      setSearchKeywords(paramSearchKeywords);
    }
  }, [paramSearchKeywords]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedKeywords) {
      params.set('q', debouncedKeywords);
    } else {
      params.delete('q');
    }

    router.replace(`/admin/${companyId}/transactions?${params.toString()}`, {
      scroll: false,
    });
  }, [debouncedKeywords]);

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

    if (
      selectedExpenses.length === displayTransactions.length &&
      displayTransactions.length > 0
    ) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(displayTransactions);
    }
  };

  const handleClearFilters = () => {
    setSearchKeywords('');
    setFilterStatus('All');
  };

  const filterSummary = useMemo(() => {
    const summary = `${displayTransactions.length} of ${baseTransactions.length} transactions`;
    return summary;
  }, [displayTransactions, baseTransactions]);

  const hasActiveFilters = useMemo(() => {
    return searchKeywords || filterStatus !== 'All';
  }, [searchKeywords, filterStatus]);

  return (
    <Sidebar>
      {UpdateExpenseStatusComp}
      <LoadingModal open={isUpdating} />
      {NotificationComp}

      {/* Modern Header Section */}
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: blueGrey[700],
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                Transactions
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage and track all your business transactions
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* {AddExpenseModal} */}
                <Box
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CalendarIcon size={20} />
                  <SelectDateRange
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Overview Section */}
      <Box sx={{ mb: 3 }}>
        <TransactionOverview transactions={displayTransactions} />
      </Box>

      {/* Modern Filters Section */}
      <Card
        sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={blueGrey[700]}
                >
                  Search
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                variant="outlined"
                size="small"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={20} color={blueGrey[500]} />
                    </InputAdornment>
                  ),
                  endAdornment: searchKeywords && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchKeywords('')}
                      >
                        <XIcon size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={1} lg={2}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={blueGrey[700]}
                >
                  Status
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                endIcon={<FilterIcon size={16} />}
                fullWidth
                sx={{
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  textTransform: 'none',
                  color:
                    filterStatus === 'All'
                      ? blueGrey[600]
                      : getTransactionStatusColor(filterStatus),
                  borderColor:
                    filterStatus === 'All'
                      ? blueGrey[300]
                      : getTransactionStatusColor(filterStatus),
                }}
              >
                {filterStatus}
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={isOpenFilter}
                onClose={() => setFilterAnchorEl(null)}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 2,
                    minWidth: 150,
                  },
                }}
              >
                {['All', 'Unpaid', 'Paid'].map((status) => (
                  <MenuItem
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setFilterAnchorEl(null);
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {filterStatus === status && (
                      <CheckIcon size={16} color={blue[600]} />
                    )}
                    <Typography
                      color={
                        status === 'All'
                          ? 'inherit'
                          : getTransactionStatusColor(status)
                      }
                    >
                      {status}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            <Grid item xs={6} md={3} lg={2}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={blueGrey[700]}
                >
                  New Expense
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>{AddExpenseButton}</Box>
            </Grid>
            {/* Actions */}
            <Grid item xs={6} md={2} lg={1.5}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={blueGrey[700]}
                >
                  Actions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>{Actions}</Box>
            </Grid>
          </Grid>

          {/* Filter Summary */}
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filterSummary}
              </Typography>
              {selectedExpenses.length > 0 && (
                <Chip
                  label={`${selectedExpenses.length} selected`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Active Filters */}
              <Stack direction="row" spacing={1}>
                {searchKeywords && (
                  <Chip
                    label={`Search: "${searchKeywords}"`}
                    size="small"
                    onDelete={() => setSearchKeywords('')}
                    color="info"
                    variant="outlined"
                  />
                )}
                {filterStatus !== 'All' && (
                  <Chip
                    label={`Status: ${filterStatus}`}
                    size="small"
                    onDelete={() => setFilterStatus('All')}
                    sx={{
                      color: getTransactionStatusColor(filterStatus),
                      borderColor: getTransactionStatusColor(filterStatus),
                    }}
                    variant="outlined"
                  />
                )}
              </Stack>

              {hasActiveFilters && (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleClearFilters}
                  sx={{
                    textTransform: 'none',
                    color: blueGrey[600],
                    '&:hover': {
                      background: blueGrey[50],
                    },
                  }}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Transactions Table Section */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ p: 4 }}>
              <LoadingComponent />
            </Box>
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
        </CardContent>
      </Card>
    </Sidebar>
  );
}
