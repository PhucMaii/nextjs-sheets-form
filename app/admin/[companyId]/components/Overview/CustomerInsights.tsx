import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  // Chip,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  People,
  TrendingUp,
  AccountBalance,
  Group,
  Warning,
} from '@mui/icons-material';
import { green, blue, orange, purple, red, yellow, grey } from '@mui/material/colors';
import { USER_CATEGORIZED } from '@/app/utils/enum';

interface CustomerInsightsProps {
  customersProfit: any;
  customersInDebt: any;
  overviewData: any;
  customers: any;
}

export default function CustomerInsights({
  customersProfit,
  customersInDebt,
  overviewData,
  customers,
}: CustomerInsightsProps) {
  const theme = useTheme();

  const insights = useMemo(() => {
    const totalOrders = overviewData?.numberOfOrders || 0;
    // const totalRevenue = overviewData?.revenue || 0;
    // Ensure arrays are valid
    // const customersProfitArray = Array.isArray(customersProfit) ? customersProfit : [];
    
    const totalCustomers = customers?.length || 0;
    const customersWithDebt = Object.keys(customersInDebt).length || 0;
    // const totalRevenue = customersProfitArray.reduce((sum: number, customer: any) => {
    //   return sum + (customer?.totalSpend || 0);
    // }, 0) || 0;
    const totalDebt = Object.keys(customersInDebt).reduce((sum: number, customer: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_unpaidOrders, unpaidAmount] = customersInDebt[customer];
      return sum + (unpaidAmount || 0);
    }, 0) || 0;

    // Customer segmentation
    const customerSegments = {
      highValue: customers.filter((c: any) => c.type === USER_CATEGORIZED.GOLD).length,
      mediumValue: customers.filter((c: any) => c.type === USER_CATEGORIZED.SILVER).length,
      lowValue: customers.filter((c: any) => c.type === USER_CATEGORIZED.BRONZE).length,
    };
    
    // Debt analysis
    const debtPercentage = totalCustomers > 0 ? (customersWithDebt / totalCustomers) * 100 : 0;
    const avgDebtPerCustomer = customersWithDebt > 0 ? totalDebt / customersWithDebt : 0;
    
    // Customer performance metrics
    const avgOrdersPerCustomer = overviewData?.numberOfOrders / customers?.length;
    
    // Customer retention analysis (simplified - based on order frequency)
    // const activeCustomers = customersProfitArray.filter((c: any) => (c?.numberOfOrders || 0) > 1).length;
    // const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
    
    // Debt risk assessment
    const highRiskDebt = Object.keys(customersInDebt).filter((c: any) => (customersInDebt[c][1] || 0) > avgDebtPerCustomer * 2).length;
    const mediumRiskDebt = Object.keys(customersInDebt).filter((c: any) => (customersInDebt[c][1] || 0) > avgDebtPerCustomer && (customersInDebt[c][1] || 0) <= avgDebtPerCustomer * 2).length;
    
    // Spending patterns
    const totalSpending = overviewData?.revenue || 0;
    const avgSpendingPerOrder = totalOrders > 0 ? totalSpending / totalOrders : 0;

    const avgCustomerValue = totalSpending / totalCustomers;

    return {
      totalCustomers,
      customersWithDebt,
      totalDebt,
      totalOrders,
      avgCustomerValue,
      customerSegments,
      debtPercentage,
      avgDebtPerCustomer,
      avgOrdersPerCustomer,
      // activeCustomers,
      // retentionRate,
      highRiskDebt,
      mediumRiskDebt,
      avgSpendingPerOrder,
    };
  }, [customersProfit, customersInDebt]);

  const metrics = [
    {
      title: 'Total Customers',
      value: customers?.length || 0,
      icon: <People />,
      color: blue[600],
      subtitle: 'Active customers',
    },
    {
      title: 'Customers in Debt',
      value: Object.keys(customersInDebt)?.length || 0,
      icon: <Group />,
      color: red[600],
      subtitle: `${insights.debtPercentage.toFixed(1)}% of customers`,
    },
    {
      title: 'Avg Customer Value',
      value: `$${insights.avgCustomerValue.toFixed(2)}`,
      icon: <TrendingUp />,
      color: green[600],
      subtitle: 'Per customer',
    },
    {
      title: 'Total Debt',
      value: `$${insights.totalDebt.toFixed(2)}`,
      icon: <AccountBalance />,
      color: orange[600],
      subtitle: 'Outstanding amount',
    },
  ];

  const performanceMetrics = [
    // {
    //   title: 'Retention Rate',
    //   value: `${insights.retentionRate.toFixed(1)}%`,
    //   progress: insights.retentionRate,
    //   color: green[600],
    //   subtitle: `${insights.activeCustomers} repeat customers`,
    // },
    {
      title: 'Avg Orders/Customer',
      value: insights.avgOrdersPerCustomer.toFixed(1),
      progress: Math.min(insights.avgOrdersPerCustomer * 20, 100), // Scale for progress bar
      color: blue[600],
      subtitle: `${overviewData?.numberOfOrders} total orders`,
    },
    {
      title: 'Avg Spending/Order',
      value: `$${insights.avgSpendingPerOrder.toFixed(2)}`,
      progress: Math.min((insights.avgSpendingPerOrder / 100) * 100, 100), // Scale for progress bar
      color: purple[600],
      subtitle: 'Per transaction',
    },
  ];

  return (
    <Card
      sx={{
        height: '100%',
        background: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: purple[50],
              color: purple[600],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <People fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Customer Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Key customer metrics and performance
            </Typography>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={2} mb={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(metric.color, 0.2)}`,
                  backgroundColor: alpha(metric.color, 0.05),
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha(metric.color, 0.1),
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box
                    sx={{
                      color: metric.color,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {metric.title}
                  </Typography>
                </Box>
                
                <Typography variant="h4" fontWeight="bold" color="text.primary" mb={0.5}>
                  {metric.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {metric.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Customer Segments */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Customer Segments
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Avatar
                  sx={{
                    bgcolor: yellow[600],
                    width: 40,
                    height: 40,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  🥇
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color={yellow[700]}>
                  {insights.customerSegments.highValue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Golden Clients
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Avatar
                  sx={{
                    bgcolor: grey[400],
                    width: 40,
                    height: 40,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  🥈
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color={grey[600]}>
                  {insights.customerSegments.mediumValue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Silver Clients
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Avatar
                  sx={{
                    bgcolor: orange[600],
                    width: 40,
                    height: 40,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  🥉
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color={orange[700]}>
                  {insights.customerSegments.lowValue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bronze Clients
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Performance Metrics */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} key={index}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {metric.title}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color={metric.color}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(metric.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" mt={0.5}>
                    {metric.subtitle}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Top Customers */}
        {/* {insights.topCustomers.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Top Customers
            </Typography>
            {insights.topCustomers.map((customer: any, index: number) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(green[600], 0.2)}`,
                  backgroundColor: alpha(green[600], 0.05),
                  mb: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      bgcolor: green[600],
                      width: 32,
                      height: 32,
                    }}
                  >
                    <Star />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {customer.customerName || 'Unknown Customer'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer.numberOfOrders || 0} orders • ${customer.totalSpend?.toFixed(2) || 0}
                    </Typography>
                  </Box>
                  <Chip
                    label={`#${index + 1}`}
                    color="success"
                    variant="filled"
                    size="small"
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )} */}

        {/* Debt Risk Analysis */}
        {insights.customersWithDebt > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Debt Risk Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(red[600], 0.2)}`,
                    backgroundColor: alpha(red[600], 0.05),
                    textAlign: 'center',
                  }}
                >
                  <Warning sx={{ color: red[600], fontSize: 24, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color={red[600]}>
                    {insights.highRiskDebt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Risk
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(yellow[600], 0.2)}`,
                    backgroundColor: alpha(yellow[600], 0.05),
                    textAlign: 'center',
                  }}
                >
                  <Warning sx={{ color: yellow[600], fontSize: 24, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color={yellow[600]}>
                    {insights.mediumRiskDebt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medium Risk
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>${insights.totalDebt.toFixed(2)}</strong> total outstanding debt across{' '}
                <strong>{insights.customersWithDebt}</strong> customers
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 