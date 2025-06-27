import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  // useTheme,
  alpha,
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { primary, success, error, warning, info } from '@/theme/color';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
    isReversed?: boolean;
  };
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  variant?: 'default' | 'gradient';
  isMinify?: boolean;
}

// Helper function to format numbers in compact view
const formatCompactNumber = (value: string | number): string => {
  if (typeof value === 'string') {
    // Handle currency strings like "$1234.56"
    if (value.startsWith('$')) {
      const numValue = parseFloat(value.replace('$', ''));
      return formatCompactCurrency(numValue);
    }
    return value;
  }

  const num = Number(value);
  if (isNaN(num)) return String(value);

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format currency in compact view
const formatCompactCurrency = (value: number): string => {
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(1) + 'K';
  }
  return '$' + value.toFixed(2);
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  variant = 'default',
  isMinify = false,
}: KPICardProps) {
  const positive = useMemo(() => {
    if (trend?.isReversed) {
      return !trend?.isPositive;
    }
    return trend?.isPositive;
  }, [trend]);
  // const theme = useTheme();

  const getColorConfig = () => {
    switch (color) {
      case 'success':
        return {
          main: success.main,
          light: success.light,
          dark: success.dark,
          lightest: success.lightest,
          gradient: `linear-gradient(135deg, ${success.main} 0%, ${success.dark} 100%)`,
          background: `linear-gradient(135deg, ${success.lightest} 0%, ${alpha(success.main, 0.05)} 100%)`,
        };
      case 'error':
        return {
          main: error.main,
          light: error.light,
          dark: error.dark,
          lightest: error.lightest,
          gradient: `linear-gradient(135deg, ${error.main} 0%, ${error.dark} 100%)`,
          background: `linear-gradient(135deg, ${error.lightest} 0%, ${alpha(error.main, 0.05)} 100%)`,
        };
      case 'warning':
        return {
          main: warning.main,
          light: warning.light,
          dark: warning.dark,
          lightest: warning.lightest,
          gradient: `linear-gradient(135deg, ${warning.main} 0%, ${warning.dark} 100%)`,
          background: `linear-gradient(135deg, ${warning.lightest} 0%, ${alpha(warning.main, 0.05)} 100%)`,
        };
      case 'info':
        return {
          main: info.main,
          light: info.light,
          dark: info.dark,
          lightest: info.lightest,
          gradient: `linear-gradient(135deg, ${info.main} 0%, ${info.dark} 100%)`,
          background: `linear-gradient(135deg, ${info.lightest} 0%, ${alpha(info.main, 0.05)} 100%)`,
        };
      default:
        return {
          main: primary.main,
          light: primary.light,
          dark: primary.dark,
          lightest: primary.lightest,
          gradient: `linear-gradient(135deg, ${primary.main} 0%, ${primary.dark} 100%)`,
          background: `linear-gradient(135deg, ${primary.lightest} 0%, ${alpha(primary.main, 0.05)} 100%)`,
        };
    }
  };

  const colorConfig = getColorConfig();
  const displayValue = isMinify ? formatCompactNumber(value) : value;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background:
          variant === 'gradient' ? colorConfig.background : 'background.paper',
        border: `1px solid ${alpha(colorConfig.main, 0.12)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: colorConfig.gradient,
          transform: 'scaleX(0)',
          transition: 'transform 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 25px -5px ${alpha(colorConfig.main, 0.1)}, 0 10px 10px -5px ${alpha(colorConfig.main, 0.04)}`,
          borderColor: colorConfig.main,
          '&::before': {
            transform: 'scaleX(1)',
          },
          '& .kpi-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            boxShadow: `0 8px 16px ${alpha(colorConfig.main, 0.3)}`,
          },
          '& .kpi-value': {
            transform: 'scale(1.02)',
          },
        },
      }}
    >
      <CardContent sx={{ p: isMinify ? 2 : 3, position: 'relative' }}>
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(colorConfig.main, 0.08)} 0%, transparent 70%)`,
            opacity: 0.6,
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header Section */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={isMinify ? 2 : 3}
          >
            <Box flex={1}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={600}
                textTransform="uppercase"
                letterSpacing={1.2}
                fontSize={isMinify ? '0.7rem' : '0.75rem'}
                sx={{
                  opacity: 0.8,
                  mb: 0.5,
                  display: 'block',
                }}
              >
                {title}
              </Typography>
            </Box>
            {icon && (
              <Box
                className="kpi-icon"
                sx={{
                  p: isMinify ? 1 : 1.5,
                  borderRadius: 3,
                  background: colorConfig.gradient,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(colorConfig.main, 0.25)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: isMinify ? 36 : 48,
                  minHeight: isMinify ? 36 : 48,
                }}
              >
                {icon}
              </Box>
            )}
          </Box>

          {/* Value Section */}
          <Box mb={isMinify ? 1 : 2}>
            <Typography
              className="kpi-value"
              variant={isMinify ? 'h4' : 'h3'}
              fontWeight={800}
              color="text.primary"
              sx={{
                background:
                  variant === 'gradient' ? colorConfig.gradient : 'none',
                backgroundClip: variant === 'gradient' ? 'text' : 'unset',
                WebkitBackgroundClip: variant === 'gradient' ? 'text' : 'unset',
                WebkitTextFillColor:
                  variant === 'gradient' ? 'transparent' : 'unset',
                transition: 'transform 0.3s ease',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {displayValue}
            </Typography>
          </Box>

          {/* Subtitle Section */}
          {subtitle && !isMinify && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: trend ? 2 : 0,
                opacity: 0.8,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Trend Section */}
          {trend && !isMinify && (
            <Box display="flex" alignItems="center" gap={1.5}>
              <Chip
                icon={positive ? <TrendingUp /> : <TrendingDown />}
                label={`${trend.value}%`}
                size="small"
                sx={{
                  background: trend.isPositive
                    ? `linear-gradient(135deg, ${success.lightest} 0%, ${alpha(success.main, 0.1)} 100%)`
                    : `linear-gradient(135deg, ${error.lightest} 0%, ${alpha(error.main, 0.1)} 100%)`,
                  color: trend.isPositive ? success.dark : error.dark,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                    fontSize: '0.875rem',
                  },
                  border: `1px solid ${positive ? alpha(success.main, 0.2) : alpha(error.main, 0.2)}`,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  opacity: 0.7,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {trend.label}
              </Typography>
            </Box>
          )}

          {/* Compact Trend Section */}
          {trend && isMinify && (
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: trend.isPositive ? success.main : error.main,
                  fontWeight: 600,  
                  fontSize: '0.75rem',
                }}
              >
                {positive ? (
                  <TrendingUp fontSize="small" />
                ) : (
                  <TrendingDown fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  component="span"
                  fontWeight="bold"
                  fontSize="0.75rem"
                >
                  {trend.value}%
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
