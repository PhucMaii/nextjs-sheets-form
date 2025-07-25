/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  Skeleton,
  Switch,
  Typography,
  useMediaQuery,
  Paper,
  Container,
  Fade,
} from '@mui/material';
import SelectDateRange from '../components/Select/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import { getAdminApiUrl } from '@/app/utils/enum';
import AreaChart from '../components/Charts/AreaChart';
import ManifestTable from '../components/Tables/ManifestTable';
import CustomersInDebt from '../components/Tables/CustomersInDebt';
import LoadingModal from '../components/Modals/LoadingModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import { fetchApi, SWRFetchData } from '@/app/utils/db';
import DebtCustomers from '../components/Printing/DebtCustomers';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import useNotification from '@/hooks/useNotification';
import CustomersProfitTable from '../components/Tables/CustomersProfitTable';
import StatusText from '../components/StatusText';
import DriverTablesReport from '../components/Tables/DriverTablesReport';
import { useParams } from 'next/navigation';

// New chart components
import DonutChart from '../components/Charts/DonutChart';
import BarChart from '../components/Charts/BarChart';
import ExpenseTrendChart from '../components/Charts/ExpenseTrendChart';

// New overview components
import KPICard from '@/app/admin/[companyId]/components/Overview/KPICard';
import KPIDetailModal from '@/app/admin/[companyId]/components/Overview/KPIDetailModal';
import OrderStatusOverview from '@/app/admin/[companyId]/components/Overview/OrderStatusOverview';
import CustomerInsights from '@/app/admin/[companyId]/components/Overview/CustomerInsights';
import ProductLossInsights from '@/app/admin/[companyId]/components/Overview/ProductLossInsights';
import ExpenseAnalytics from '@/app/admin/[companyId]/components/Overview/ExpenseAnalytics';

// Icons
import {
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  ShoppingCart,
  People,
  Assessment,
  Analytics,
  Dashboard,
  AttachMoney,
} from '@mui/icons-material';

// Import app's color theme
import { primary, success, error, warning, info, neutral } from '@/theme/color';
import { formatCurrency, formatNumberWith2Decimal } from '@/app/utils/number';

// Unified blue theme color palette
const themeColors = {
  primary: {
    main: primary.main,
    light: primary.light,
    dark: primary.dark,
    gradient: `linear-gradient(135deg, ${primary.main} 0%, ${primary.dark} 100%)`,
    background: primary.lightest,
  },
  success: {
    main: success.main,
    light: success.light,
    dark: success.dark,
    gradient: `linear-gradient(135deg, ${success.main} 0%, ${success.dark} 100%)`,
    background: success.lightest,
  },
  error: {
    main: error.main,
    light: error.light,
    dark: error.dark,
    gradient: `linear-gradient(135deg, ${error.main} 0%, ${error.dark} 100%)`,
    background: error.lightest,
  },
  warning: {
    main: warning.main,
    light: warning.light,
    dark: warning.dark,
    gradient: `linear-gradient(135deg, ${warning.main} 0%, ${warning.dark} 100%)`,
    background: warning.lightest,
  },
  info: {
    main: info.main,
    light: info.light,
    dark: info.dark,
    gradient: `linear-gradient(135deg, ${info.main} 0%, ${info.dark} 100%)`,
    background: info.lightest,
  },
  neutral: {
    main: neutral[500],
    light: neutral[200],
    dark: neutral[700],
    background: neutral[50],
  },
};

export default function Overview() {
  const { companyId }: any = useParams();
  const [customers, setCustomers] = useState<any>();
  const [customersInDebt, setCustomersInDebt] = useState<any>();
  const [customersProfit, setCustomersProfit] = useState<any>();
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [overviewData, setOverviewData] = useState<any>();
  const [revenueData, setRevenueData] = useState<any>();
  const [productLossData, setProductLossData] = useState<any>();
  const [isMinify, setIsMinify] = useLocalStorage('isMinify', false);
  const { NotificationComp } = useNotification();

  // Modal state management
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<any | null>(null);

  // Printing Ref
  const printDetbCustomersRef: any = useRef();

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));

  // Data Fetching
  const [overview, _mutateOverview, isValidating] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/orders/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
    ),
  );
  const [shiftOverview] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/shifts/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
    ),
  );

  useEffect(() => {
    if (overview && dateRange) {
      initializeOverviewData();
      fetchProductLossData();
    }
  }, [overview, dateRange]);

  // Handle loading
  useEffect(() => {
    if (!overview && isValidating) {
      setIsFetching(true);
    } else {
      setIsFetching(false);
    }
  }, [dateRange, overview]);

  const initializeOverviewData = () => {
    const overviewFetchedData = overview.data;
    setOverviewData(overviewFetchedData.overviewData);
    setRevenueData(overviewFetchedData.reports);
    setCustomersInDebt(overviewFetchedData.customersInDebt);
    setCustomersProfit(overviewFetchedData.customersProfit);
    setCustomers(overviewFetchedData.customers);
  };

  const handlePrintCustomersInDebt = useReactToPrint({
    content: () => printDetbCustomersRef.current,
  });

  const fetchProductLossData = async () => {
    const data = await fetchApi(
      getAdminApiUrl(
        companyId,
        `/product-loss/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
      ),
    );
    setProductLossData(data);
  };

  // Prepare data for new charts
  const getProfitLossData = () => {
    if (!overviewData) return [];
    return [
      {
        label: 'Revenue',
        value: overviewData.revenue || 0,
        color: success.main,
      },
      {
        label: 'Expenses',
        value: overviewData.expenses || 0,
        color: error.main,
      },
      { label: 'Profit', value: overviewData.profit || 0, color: primary.main },
    ];
  };

  const getOrderTrendData = () => {
    if (!revenueData?.timeSeries) return { timeSeries: [], data: [] };
    return {
      timeSeries: revenueData.timeSeries,
      data: revenueData.thisMonth || [],
    };
  };

  const getTopProductsData = () => {
    if (!productLossData?.losses) return { categories: [], data: [] };

    // Group losses by product and calculate totals
    const productLossMap = new Map();

    productLossData.losses.forEach((loss: any) => {
      const productName = loss?.inventoryItem?.name || 'Unknown Product';
      const lossAmount = loss?.totalCost || 0;
      const lossQuantity = loss?.quantityLost || 0;
      const lossType = loss?.lossType || 'Unknown';

      if (!productLossMap.has(productName)) {
        productLossMap.set(productName, {
          totalLoss: 0,
          totalQuantity: 0,
          lossTypes: new Set(),
          reports: 0,
        });
      }

      const productData = productLossMap.get(productName);
      productData.totalLoss += lossAmount;
      productData.totalQuantity += lossQuantity;
      productData.lossTypes.add(lossType);
      productData.reports += 1;
    });

    // Convert to array and sort by total loss
    const sortedProducts = Array.from(productLossMap.entries())
      .map(([productName, data]: [string, any]) => ({
        name: productName,
        totalLoss: data.totalLoss,
        totalQuantity: data.totalQuantity,
        lossTypes: Array.from(data.lossTypes),
        reports: data.reports,
      }))
      .sort((a, b) => b.totalLoss - a.totalLoss)
      .slice(0, 3); // Show top 3 products


    // Prepare data for chart
    const categories = sortedProducts.map((product) => `${product.name}`);
    const data = sortedProducts.map((product) => product.totalLoss);

    return {
      categories,
      data,
      detailedData: sortedProducts, // Keep detailed data for tooltips or other uses
    };
  };

  // KPI Click Handlers
  const handleKPIClick = (
    type:
      | 'revenue'
      | 'expenses'
      | 'orders'
      | 'profit'
      | 'margin'
      | 'ratio'
      | 'avgOrder'
      | 'customers',
    title: string,
    value: string | number,
    color: 'primary' | 'success' | 'error' | 'warning' | 'info',
    lastMonthValue: string | number,
    comparePercentage?: string | number,
    isPositive?: boolean,
    isReversed?: boolean,
  ) => {
    setSelectedKPI({
      type,
      title,
      value,
      color,
      lastMonthValue,
      comparePercentage,
      isPositive,
      isReversed,
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedKPI(null);
  };

  return (
    <Sidebar>
      <div style={{ display: 'none' }}>
        <DebtCustomers
          debtCustomers={customersInDebt}
          ref={printDetbCustomersRef}
        />
      </div>
      <LoadingModal open={isFetching} />
      {NotificationComp}

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header Section */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Comprehensive business insights and analytics
                </Typography>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <SelectDateRange
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
                <Box display="flex" alignItems="center" gap={1}>
                  <Switch
                    checked={isMinify}
                    onChange={(e) => setIsMinify(e.target.checked)}
                  />
                  <Typography variant="subtitle2">Compact View</Typography>
                </Box>
              </Box>
            </Box>

            {/* Enhanced KPI Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Total Revenue"
                  value={`$${(overviewData?.revenue || 0).toFixed(2)}`}
                  icon={<MonetizationOn />}
                  color="success"
                  variant="gradient"
                  isMinify={isMinify}
                  trend={{
                    value: overviewData?.revenueChange?.toFixed(2) || 0,
                    isPositive: (overviewData?.revenueChange || 0) > 0,
                    label: 'vs last period',
                  }}
                  onClick={() =>
                    handleKPIClick(
                      'revenue',
                      'Total Revenue',
                      `$${formatNumberWith2Decimal(overviewData?.revenue || 0)}`,
                      'success',
                      `$${
                        formatNumberWith2Decimal(
                          overviewData?.lastMonthRevenueReport?.revenue || 0,
                        )
                      }`,
                      formatNumberWith2Decimal(overviewData?.revenueChange || 0),
                      (overviewData?.revenueChange || 0) > 0,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Total Expenses"
                  value={`$${(overviewData?.expenses || 0).toFixed(2)}`}
                  icon={<AttachMoney />}
                  color="error"
                  variant="gradient"
                  isMinify={isMinify}
                  trend={{
                    value: overviewData?.expensesChange?.toFixed(2) || 0,
                    isPositive: (overviewData?.expensesChange || 0) < 0,
                    label: 'vs last period',
                    isReversed: true,
                  }}
                  onClick={() =>
                    handleKPIClick(
                      'expenses',
                      'Total Expenses',
                      `$${formatNumberWith2Decimal(overviewData?.expenses || 0)}`,
                      'error',
                      `$${formatNumberWith2Decimal(
                        overviewData?.lastMonthExpensesReport || 0,
                      )}`,
                      formatNumberWith2Decimal(overviewData?.expensesChange || 0),
                      (overviewData?.expensesChange || 0) < 0,
                      true,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Total Orders"
                  value={overviewData?.numberOfOrders || 0}
                  icon={<ShoppingCart />}
                  color="primary"
                  variant="gradient"
                  isMinify={isMinify}
                  subtitle="Orders processed"
                  onClick={() =>
                    handleKPIClick(
                      'orders',
                      'Total Orders',
                      overviewData?.numberOfOrders || 0,
                      'primary',
                      overviewData?.lastMonthRevenueReport?.numberOfOrders || 0,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Net Profit"
                  value={`$${formatNumberWith2Decimal(overviewData?.profit || 0)}`}
                  icon={<TrendingUp />}
                  color="warning"
                  variant="gradient"
                  isMinify={isMinify}
                  trend={{
                    value: overviewData?.profitChange?.toFixed(2) || 0,
                    isPositive: (overviewData?.profitChange || 0) > 0,
                    label: 'vs last period',
                  }}
                  onClick={() =>
                    handleKPIClick(
                      'profit',
                      'Net Profit',
                      `$${formatNumberWith2Decimal(overviewData?.profit || 0)}`,
                      'warning',
                      `$${formatNumberWith2Decimal(
                        overviewData?.lastMonthProfit || 0,
                      )}`,
                      formatNumberWith2Decimal(overviewData?.profitChange || 0),
                      (overviewData?.profitChange || 0) > 0,
                    )
                  }
                />
              </Grid>
            </Grid>

            {/* Additional KPI Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Profit Margin"
                  value={`${formatNumberWith2Decimal(overviewData?.profitMargin || 0)}%`}
                  icon={<Analytics />}
                  color="success"
                  variant="gradient"
                  isMinify={isMinify}
                  subtitle="Financial health"
                  onClick={() =>
                    handleKPIClick(
                      'margin',
                      'Profit Margin',
                      `${formatNumberWith2Decimal(overviewData?.profitMargin || 0)}%`,
                      'success',
                      `${formatNumberWith2Decimal(
                        overviewData?.lastMonthProfitMargin || 0,
                      )}%`,
                      formatNumberWith2Decimal(overviewData?.profitMarginChange || 0),
                      (overviewData?.profitMarginChange || 0) > 0,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Expense Ratio"
                  value={`${(((overviewData?.expenses || 0) / (overviewData?.revenue || 1)) * 100).toFixed(1)}%`}
                  icon={<Assessment />}
                  color="error"
                  variant="gradient"
                  isMinify={isMinify}
                  subtitle="Cost efficiency"
                  onClick={() =>
                    handleKPIClick(
                      'ratio',
                      'Expense Ratio',
                      `${formatNumberWith2Decimal(
                        overviewData?.expensesRatio || 0,
                      )}%`,
                      'error',
                      `${formatNumberWith2Decimal(
                        overviewData?.lastMonthExpensesRatio || 0,
                      )}%`,
                      formatNumberWith2Decimal(overviewData?.expensesRatioChange || 0),
                      (overviewData?.expensesRatioChange || 0) < 0,
                      true,
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Avg Order Value"
                  value={`$${formatNumberWith2Decimal(overviewData?.avgOrderValue || 0)}`}
                  icon={<ShoppingCart />}
                  color="primary"
                  variant="gradient"
                  isMinify={isMinify}
                  subtitle="Revenue per order"
                  onClick={() =>
                    handleKPIClick(
                      'avgOrder',
                      'Avg Order Value',
                      `$${formatNumberWith2Decimal(overviewData?.avgOrderValue || 0)}`,
                      'primary',
                      `$${formatNumberWith2Decimal(
                        overviewData?.lastMonthAvgOrderValue || 0,
                      )}`,
                      formatNumberWith2Decimal(overviewData?.avgOrderValueChange || 0),
                      (overviewData?.avgOrderValueChange || 0) > 0,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <KPICard
                  title="Active Customers"
                  value={overviewData?.activeCustomers || 0}
                  icon={<People />}
                  color="info"
                  variant="gradient"
                  isMinify={isMinify}
                  subtitle="Engaged customers"
                />
              </Grid>
            </Grid>

            {/* Quick Expense Summary */}
            {/* <Grid container spacing={3} mb={4}> */}
            {/* <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${themeColors.error.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: themeColors.error.gradient,
                        color: 'white',
                        boxShadow: `0 4px 6px -1px ${error.main}40`,
                      }}
                    >
                      <AttachMoney />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Expense Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quick overview of cost structure and efficiency
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="error.main">
                          ${(overviewData?.expenses || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Expenses
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                          {((overviewData?.expenses || 0) / (overviewData?.revenue || 1) * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expense Ratio
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          ${(overviewData?.profit || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Net Profit
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {((overviewData?.profit || 0) / (overviewData?.revenue || 1) * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Profit Margin
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid> */}

            {/* Main Charts Section */}
            <Grid container spacing={3} mb={4}>
              {/* Revenue Chart */}
              <Grid item xs={12} lg={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: 400,
                    background: `linear-gradient(135deg, ${themeColors.primary.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: themeColors.success.gradient,
                        color: 'white',
                        boxShadow: `0 4px 6px -1px ${success.main}40`,
                      }}
                    >
                      <TrendingUp />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Revenue Trend
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Revenue performance over time
                      </Typography>
                    </Box>
                  </Box>
                  {revenueData ? (
                    <AreaChart
                      timeSeries={revenueData.timeSeries}
                      thisMonthData={revenueData.thisMonth}
                      lastMonthData={revenueData.lastMonth}
                    />
                  ) : (
                    <Skeleton variant="rounded" height={300} />
                  )}
                </Paper>
              </Grid>

              {/* Expense Trend Chart */}
              <Grid item xs={12} lg={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: 400,
                    background: `linear-gradient(135deg, ${themeColors.error.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: themeColors.error.gradient,
                        color: 'white',
                        boxShadow: `0 4px 6px -1px ${error.main}40`,
                      }}
                    >
                      <AttachMoney />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Expense Trend
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cost tracking and analysis
                      </Typography>
                    </Box>
                  </Box>
                  {overviewData ? (
                    <ExpenseTrendChart
                      dateRange={dateRange}
                      revenueData={revenueData}
                      height={300}
                    />
                  ) : (
                    <Skeleton variant="rounded" height={300} />
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Financial Overview Chart */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: 400,
                    background: `linear-gradient(135deg, ${themeColors.info.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: themeColors.info.gradient,
                        color: 'white',
                        boxShadow: `0 4px 6px -1px ${info.main}40`,
                      }}
                    >
                      <Assessment />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Financial Overview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Revenue, expenses & profit breakdown
                      </Typography>
                    </Box>
                  </Box>
                  {overviewData ? (
                    <DonutChart
                      data={getProfitLossData()}
                      title="Financial Summary"
                      height={280}
                    />
                  ) : (
                    <Skeleton variant="rounded" height={280} />
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Secondary Charts Section */}
            <Grid container spacing={3} mb={4}>
              {/* Order Status Overview */}
              <Grid item xs={12} md={6}>
                <OrderStatusOverview overviewData={overviewData} />
              </Grid>

              {/* Customer Insights */}
              <Grid item xs={12} md={6}>
                <CustomerInsights
                  customersProfit={customersProfit || []}
                  customersInDebt={customersInDebt || []}
                  overviewData={overviewData}
                  customers={customers || []}
                />
              </Grid>
            </Grid>

            {/* Expense Analytics Section */}
            {/* <Grid container spacing={3} mb={4}>
              <Grid item xs={12}>
                <ExpenseAnalytics
                  overviewData={overviewData}
                  dateRange={dateRange}
                />
              </Grid>
            </Grid> */}

            {/* Product Loss Section */}
            <Grid container spacing={3} mb={4}>
              {/* Product Loss Insights */}
              <Grid item xs={12} md={8}>
                <ProductLossInsights productLossData={productLossData} />
              </Grid>

              {/* Top Product Losses Chart */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: 400,
                    background: `linear-gradient(135deg, ${themeColors.warning.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: themeColors.warning.gradient,
                        color: 'white',
                        boxShadow: `0 4px 6px -1px ${warning.main}40`,
                      }}
                    >
                      <Analytics />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Top Product Losses
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Products with highest loss amounts
                      </Typography>
                    </Box>
                  </Box>
                  {productLossData ? (
                    <BarChart
                      categories={getTopProductsData().categories}
                      data={getTopProductsData().data}
                      title="Product Losses"
                      color={warning.main}
                      height={300}
                      horizontal={true}
                      detailedData={getTopProductsData().detailedData}
                      customTooltip={true}
                    />
                  ) : (
                    <Skeleton variant="rounded" height={300} />
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Shift Overview Section */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${themeColors.primary.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: themeColors.primary.gradient,
                        color: 'white',
                        boxShadow: `0 4px 6px -1px ${primary.main}40`,
                      }}
                    >
                      <Dashboard />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Shift Overview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Employee hours and costs analysis
                      </Typography>
                    </Box>
                  </Box>

                  {shiftOverview ? (
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box>
                            <Typography
                              variant={mdDown ? 'h5' : 'h3'}
                              fontWeight="bold"
                              color="primary"
                            >
                              {shiftOverview?.totalHours?.toFixed(2)}h
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Total Hours
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                              mt={2}
                            >
                              <StatusText
                                text={`${shiftOverview?.unpaidShifts?.length}h`}
                                type="error"
                              />
                              <StatusText
                                text={`${shiftOverview?.paidShifts?.length}h`}
                                type="success"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box>
                            <Typography
                              variant={mdDown ? 'h5' : 'h3'}
                              fontWeight="bold"
                              color="primary"
                            >
                              ${shiftOverview?.totalCosts?.toFixed(2)}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Employee Costs
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                              mt={2}
                            >
                              <StatusText
                                text={`$${shiftOverview?.unpaidShiftCost?.toFixed(2)}`}
                                type="error"
                              />
                              <StatusText
                                text={`$${shiftOverview?.paidShiftCost?.toFixed(2)}`}
                                type="success"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Skeleton variant="rounded" height={100} />
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Tables Section */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${themeColors.neutral.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Drivers Reports
                  </Typography>
                  {shiftOverview ? (
                    <DriverTablesReport data={shiftOverview.driverReports} />
                  ) : (
                    <Skeleton variant="rounded" height={200} />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${themeColors.neutral.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Customer&apos;s Profit Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Calculate based on all orders in selected date range
                  </Typography>
                  <CustomersProfitTable
                    customersProfit={customersProfit || []}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${themeColors.neutral.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Manifest - Delivered Items
                  </Typography>
                  <ManifestTable
                    isMinify={isMinify}
                    manifest={overviewData?.manifest || null}
                    isAdmin
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${themeColors.neutral.background} 0%, #ffffff 100%)`,
                    border: '1px solid',
                    borderColor: themeColors.neutral.light,
                    borderRadius: 3,
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Customers in Debt
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrintCustomersInDebt}
                      sx={{
                        borderColor: primary.main,
                        color: primary.main,
                        '&:hover': {
                          borderColor: primary.dark,
                          backgroundColor: primary.lightest,
                        },
                      }}
                    >
                      Print Report
                    </Button>
                  </Box>
                  <CustomersInDebt customersInDebt={customersInDebt} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
      {selectedKPI && (
        <KPIDetailModal
          open={modalOpen}
          onClose={handleModalClose}
          kpiType={selectedKPI.type}
          title={selectedKPI.title}
          currentValue={selectedKPI.value}
          color={selectedKPI.color}
          lastMonthValue={selectedKPI.lastMonthValue}
          comparePercentage={selectedKPI.comparePercentage}
          isPositive={selectedKPI.isPositive}
          isReversed={selectedKPI.isReversed}
        />
      )}
    </Sidebar>
  );
}
