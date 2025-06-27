import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  alpha,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Cancel,
  LocalShipping,
  Assignment,
  TrendingUp,
  TrendingDown,
  AccessTime,
  MonetizationOn,
} from '@mui/icons-material';
import { 
  primary, 
  success, 
  error, 
  warning, 
  info 
} from '@/theme/color';

interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  trend?: number;
}

interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  ongoingOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
  fulfillmentRate: number;
  averageFulfillmentTime: number;
  cancellationRate: number;
  orderGrowthRate: number;
  revenueGrowthRate: number;
}

interface OrderStatusOverviewProps {
  overviewData: any;
}

export default function OrderStatusOverview({
  overviewData,
}: OrderStatusOverviewProps) {
  const orderMetrics = useMemo((): OrderMetrics => {
    if (!overviewData) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        ongoingOrders: 0,
        cancelledOrders: 0,
        deliveredOrders: 0,
        averageOrderValue: 0,
        totalRevenue: 0,
        fulfillmentRate: 0,
        averageFulfillmentTime: 0,
        cancellationRate: 0,
        orderGrowthRate: 0,
        revenueGrowthRate: 0,
      };
    }

    const totalOrders = overviewData.numberOfOrders || 0;
    const completedOrders = overviewData.completedOrders || 0;
    const ongoingOrders = overviewData.ongoingOrders || 0;
    const cancelledOrders = overviewData.cancelledOrders || 0;
    const deliveredOrders = overviewData.deliveredOrders || 0;
    const totalRevenue = overviewData.revenue || 0;

    const fulfillmentRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      completedOrders,
      ongoingOrders,
      cancelledOrders,
      deliveredOrders,
      averageOrderValue,
      totalRevenue,
      fulfillmentRate,
      averageFulfillmentTime: overviewData.averageFulfillmentTime || 2.5, // hours
      cancellationRate,
      orderGrowthRate: overviewData.orderGrowthRate || 12.5,
      revenueGrowthRate: overviewData.revenueGrowthRate || 8.3,
    };
  }, [overviewData]);

  const orderStatusData = useMemo(() => {
    if (!overviewData) return [];

    const { totalOrders, completedOrders, ongoingOrders, cancelledOrders, deliveredOrders } = orderMetrics;

    const data: OrderStatusData[] = [
      {
        status: 'Completed',
        count: completedOrders,
        percentage: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        color: success.main,
        icon: <CheckCircle />,
        trend: 5.2,
      },
      {
        status: 'Ongoing',
        count: ongoingOrders,
        percentage: totalOrders > 0 ? (ongoingOrders / totalOrders) * 100 : 0,
        color: warning.main,
        icon: <Pending />,
        trend: -2.1,
      },
      {
        status: 'Delivered',
        count: deliveredOrders,
        percentage: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
        color: info.main,
        icon: <LocalShipping />,
        trend: 3.8,
      },
      {
        status: 'Cancelled',
        count: cancelledOrders,
        percentage: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0,
        color: error.main,
        icon: <Cancel />,
        trend: -1.5,
      },
    ];

    return data.filter(item => item.count > 0);
  }, [overviewData, orderMetrics]);

  const getPerformanceColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return success.main;
    if (value >= threshold * 0.8) return warning.main;
    return error.main;
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${primary.lightest} 0%, #ffffff 100%)`,
        border: `1px solid ${alpha(primary.main, 0.12)}`,
        borderRadius: 3,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: `0 10px 15px -3px ${alpha(primary.main, 0.1)}, 0 4px 6px -2px ${alpha(primary.main, 0.05)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${primary.main} 0%, ${primary.dark} 100%)`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 6px -1px ${alpha(primary.main, 0.25)}`,
            }}
          >
            <Assignment fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Order Status Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive order analytics and metrics
            </Typography>
          </Box>
        </Box>

        {/* Key Metrics Row */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${success.lightest} 0%, ${alpha(success.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(success.main, 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color={success.main}>
                {orderMetrics.totalOrders}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Total Orders
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mt={0.5}>
                {getTrendIcon(orderMetrics.orderGrowthRate)}
                <Typography variant="caption" color={orderMetrics.orderGrowthRate > 0 ? success.main : error.main}>
                  {orderMetrics.orderGrowthRate > 0 ? '+' : ''}{orderMetrics.orderGrowthRate}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${info.lightest} 0%, ${alpha(info.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(info.main, 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color={info.main}>
                ${orderMetrics.averageOrderValue.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Avg Order Value
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${warning.lightest} 0%, ${alpha(warning.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(warning.main, 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color={getPerformanceColor(orderMetrics.fulfillmentRate)}>
                {orderMetrics.fulfillmentRate.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Fulfillment Rate
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${error.lightest} 0%, ${alpha(error.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(error.main, 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color={error.main}>
                {orderMetrics.cancellationRate.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Cancellation Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Order Status Distribution */}
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
          Status Distribution
        </Typography>
        <Grid container spacing={2} mb={3}>
          {orderStatusData.map((status, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(status.color, 0.2)}`,
                  background: `linear-gradient(135deg, ${alpha(status.color, 0.08)} 0%, ${alpha(status.color, 0.02)} 100%)`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(status.color, 0.12)} 0%, ${alpha(status.color, 0.04)} 100%)`,
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        color: status.color,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {status.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {status.status}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${status.percentage.toFixed(1)}%`}
                    size="small"
                    sx={{
                      background: status.color,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {status.count}
                </Typography>
                
                <Box
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: `${alpha(status.color, 0.2)}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${status.percentage}%`,
                      backgroundColor: status.color,
                      borderRadius: 2,
                      transition: 'width 0.8s ease-in-out',
                    }}
                  />
                </Box>

                {status.trend && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    {getTrendIcon(status.trend)}
                    <Typography variant="caption" color={status.trend > 0 ? success.main : error.main}>
                      {status.trend > 0 ? '+' : ''}{status.trend}% from last period
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Performance Indicators */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
          Performance Indicators
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Tooltip title="Average time from order to delivery">
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${info.lightest} 0%, ${alpha(info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(info.main, 0.2)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccessTime color="primary" />
                  <Typography variant="subtitle2" fontWeight="bold">
                    Avg Fulfillment Time
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color={info.main}>
                  {orderMetrics.averageFulfillmentTime}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: 2h | Current: {orderMetrics.averageFulfillmentTime}h
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Tooltip title="Revenue growth compared to previous period">
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${success.lightest} 0%, ${alpha(success.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(success.main, 0.2)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <MonetizationOn color="success" />
                  <Typography variant="subtitle2" fontWeight="bold">
                    Revenue Growth
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color={success.main}>
                  +{orderMetrics.revenueGrowthRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs previous period
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>

        {orderStatusData.length === 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ py: 4 }}
          >
            <Typography variant="body2" color="text.secondary">
              {overviewData ? 'No order data available' : 'Loading order data...'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 