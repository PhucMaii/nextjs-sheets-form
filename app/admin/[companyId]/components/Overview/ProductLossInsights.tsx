import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  TrendingDown,
  Inventory2,
  Warning,
  Assessment,
  LocalOffer,
} from '@mui/icons-material';
import { red, orange, blue, green, purple } from '@mui/material/colors';

interface ProductLossInsightsProps {
  productLossData: any;
}

export default function ProductLossInsights({
  productLossData,
}: ProductLossInsightsProps) {
  const theme = useTheme();

  const insights = useMemo(() => {
    if (!productLossData?.productLosses) {
      return {
        totalLoss: 0,
        totalQuantity: 0,
        totalReports: 0,
        lossTypes: {},
        avgLossPerReport: 0,
        mostExpensiveLoss: null,
        lossTypeBreakdown: [],
      };
    }

    const losses = productLossData.productLosses;
    const totalLoss = losses.reduce((sum: number, loss: any) => sum + (loss?.totalCost || 0), 0);
    const totalQuantity = losses.reduce((sum: number, loss: any) => sum + (loss?.quantityLost || 0), 0);
    const totalReports = losses.length;
    const avgLossPerReport = totalReports > 0 ? totalLoss / totalReports : 0;

    // Group by loss type
    const lossTypes: any = {};
    losses.forEach((loss: any) => {
      const type = loss?.lossType || 'Unknown';
      if (!lossTypes[type]) {
        lossTypes[type] = {
          count: 0,
          totalLoss: 0,
          totalQuantity: 0,
        };
      }
      lossTypes[type].count += 1;
      lossTypes[type].totalLoss += loss?.totalCost || 0;
      lossTypes[type].totalQuantity += loss?.quantityLost || 0;
    });

    // Find most expensive single loss
    const mostExpensiveLoss = losses.reduce((max: any, loss: any) => {
      return (loss?.totalCost || 0) > (max?.totalCost || 0) ? loss : max;
    }, null);

    // Convert loss types to array for display
    const lossTypeBreakdown = Object.entries(lossTypes).map(([type, data]: [string, any]) => ({
      type,
      count: data.count,
      totalLoss: data.totalLoss,
      totalQuantity: data.totalQuantity,
      percentage: totalLoss > 0 ? (data.totalLoss / totalLoss) * 100 : 0,
    })).sort((a, b) => b.totalLoss - a.totalLoss);

    return {
      totalLoss,
      totalQuantity,
      totalReports,
      lossTypes,
      avgLossPerReport,
      mostExpensiveLoss,
      lossTypeBreakdown,
    };
  }, [productLossData]);

  const metrics = [
    {
      title: 'Total Loss Value',
      value: `$${insights.totalLoss.toFixed(2)}`,
      icon: <TrendingDown />,
      color: red[600],
      subtitle: 'Total financial impact',
    },
    {
      title: 'Total Quantity Lost',
      value: insights.totalQuantity,
      icon: <Inventory2 />,
      color: orange[600],
      subtitle: 'Units lost',
    },
    {
      title: 'Average Loss/Report',
      value: `$${insights.avgLossPerReport.toFixed(2)}`,
      icon: <Assessment />,
      color: blue[600],
      subtitle: 'Per incident',
    },
    {
      title: 'Total Reports',
      value: insights.totalReports,
      icon: <Warning />,
      color: purple[600],
      subtitle: 'Loss incidents',
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
              backgroundColor: red[50],
              color: red[600],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingDown fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Product Loss Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed loss analysis and insights
            </Typography>
          </Box>
        </Box>

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

        {insights.lossTypeBreakdown.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Loss Type Breakdown
            </Typography>
            <Grid container spacing={1}>
              {insights.lossTypeBreakdown.slice(0, 4).map((lossType, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(blue[600], 0.2)}`,
                      backgroundColor: alpha(blue[600], 0.05),
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {lossType.type}
                      </Typography>
                      <Chip
                        label={`${lossType.percentage.toFixed(1)}%`}
                        size="small"
                        sx={{
                          backgroundColor: blue[600],
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      ${lossType.totalLoss.toFixed(2)} • {lossType.count} reports
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {insights.mostExpensiveLoss && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Most Expensive Loss
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(red[600], 0.2)}`,
                backgroundColor: alpha(red[600], 0.05),
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <LocalOffer sx={{ color: red[600] }} />
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {insights.mostExpensiveLoss?.inventoryItem?.name || 'Unknown Product'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {insights.mostExpensiveLoss?.lossType} • {insights.mostExpensiveLoss?.quantityLost} units
                  </Typography>
                </Box>
                <Chip
                  label={`$${insights.mostExpensiveLoss?.totalCost?.toFixed(2)}`}
                  color="error"
                  variant="filled"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 