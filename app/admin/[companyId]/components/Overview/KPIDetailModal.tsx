import React, { memo, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  LinearProgress,
  useMediaQuery,
  useTheme,
  alpha,
  AlertColor,
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  ShoppingCart,
  People,
  AttachMoney,
  Assessment,
} from '@mui/icons-material';
import { primary, success, error, warning, info } from '@/theme/color';

type KPIType =
  | 'revenue'
  | 'expenses'
  | 'orders'
  | 'profit'
  | 'margin'
  | 'ratio'
  | 'avgOrder'
  | 'customers';

interface KPIDetailModalProps {
  open: boolean;
  onClose: () => void;
  kpiType: KPIType;
  title: string;
  currentValue: number;
  lastMonthValue: number;
  comparePercentage?: string | number;
  isPositive?: boolean;
  color: AlertColor;
  isReversed?: boolean;
}

const getColorConfig = (color: string) => {
  switch (color) {
    case 'success':
      return {
        main: success.main,
        light: success.light,
        dark: success.dark,
        lightest: success.lightest,
      };
    case 'error':
      return {
        main: error.main,
        light: error.light,
        dark: error.dark,
        lightest: error.lightest,
      };
    case 'warning':
      return {
        main: warning.main,
        light: warning.light,
        dark: warning.dark,
        lightest: warning.lightest,
      };
    case 'info':
      return {
        main: info.main,
        light: info.light,
        dark: info.dark,
        lightest: info.lightest,
      };
    default:
      return {
        main: primary.main,
        light: primary.light,
        dark: primary.dark,
        lightest: primary.lightest,
      };
  }
};

const KPIDetailModal = ({
  open,
  onClose,
  kpiType,
  title,
  currentValue,
  lastMonthValue,
  comparePercentage,
  isPositive,
  color,
  isReversed,
}: KPIDetailModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const colorConfig = getColorConfig(color);

  const positive = useMemo(() => {
    if (isReversed) {
      return !isPositive;
    }
    return isPositive;
  }, [isReversed, isPositive]);

  const percentage = useMemo(() => {
    return (
      Math.round(
        ((currentValue - lastMonthValue) / lastMonthValue) * 100 * 100,
      ) / 100
    );
  }, [currentValue, lastMonthValue]);

  const targetProgress = isReversed
    ? 100 - (Number(comparePercentage) || Number(percentage))
    : 100 + (Number(comparePercentage) || Number(percentage));

  const getIcon = () => {
    switch (kpiType) {
      case 'revenue':
        return <MonetizationOn />;
      case 'expenses':
        return <AttachMoney />;
      case 'orders':
        return <ShoppingCart />;
      case 'customers':
        return <People />;
      default:
        return <Assessment />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          maxHeight: '90vh',
          width: '80vw',
          background: `linear-gradient(135deg, ${colorConfig.lightest} 0%, #ffffff 100%)`,
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${colorConfig.main} 0%, ${colorConfig.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: alpha('#ffffff', 0.1),
          }}
        />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          position="relative"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: alpha('#ffffff', 0.2),
                backdropFilter: 'blur(10px)',
              }}
            >
              {getIcon()}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {title} Insights
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Detailed analysis and performance metrics
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              background: alpha('#ffffff', 0.1),
              '&:hover': {
                background: alpha('#ffffff', 0.2),
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box p={3}>
          {/* Current Value & Key Metrics */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${colorConfig.lightest} 0%, #ffffff 100%)`,
                  border: `2px solid ${colorConfig.light}`,
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color={colorConfig.main}
                  mb={1}
                >
                  {currentValue}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Current {title}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                  mb={1}
                >
                  {positive ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color={isPositive ? 'success' : 'error'} />
                  )}
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={isPositive ? 'success.main' : 'error.main'}
                  >
                    {comparePercentage || percentage}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  vs Previous Period
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                  mb={1}
                >
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={colorConfig.main}
                  >
                    {lastMonthValue}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Last Period {title}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Target Progress */}
          {!isReversed && <Card elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Assessment color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Target Progress
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" mb={2}>
              Need to be at least same as last month
            </Typography>
            <Box display="flex" alignItems="center" gap={2} my={2}>
              <Box flex={1}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(targetProgress, 100)}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: alpha(colorConfig.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${colorConfig.main} 0%, ${colorConfig.dark} 100%)`,
                      borderRadius: 6,
                    },
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={colorConfig.main}
              >
                {targetProgress.toFixed(1)}%
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Current: {currentValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Target: {lastMonthValue}
              </Typography>
            </Box>
          </Card>}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default memo(KPIDetailModal, (prevProps, nextProps) => {
  return (
    prevProps.open === nextProps.open && prevProps.kpiType === nextProps.kpiType
  );
});
