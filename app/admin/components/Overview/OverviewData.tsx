import React, { useMemo } from 'react';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LoopIcon from '@mui/icons-material/Loop';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Grid } from '@mui/material';
import { primary, primaryColor } from '@/theme/color';
import { minifyNumber } from '@/app/utils/number';
import OverviewCard from '../OverviewCard/OverviewCard';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { green, red } from '@mui/material/colors';

interface IProps {
  isMinify: boolean;
  overviewData: any;
}

export default function OverviewData({ isMinify, overviewData }: IProps) {
  const revenue = useMemo(() => {
    if (!overviewData) {
      return 0;
    }

    if (isMinify) {
      return minifyNumber(overviewData.revenue);
    }

    return overviewData.revenue.toFixed(2);
  }, [isMinify, overviewData]);

  const expenses = useMemo(() => {
    if (!overviewData) {
      return 0;
    }

    if (isMinify) {
      return minifyNumber(overviewData.expenses);
    }

    return overviewData.expenses.toFixed(2);
  }, [isMinify, overviewData]);

  const profit = useMemo(() => {
    if (!overviewData) {
      return 0;
    }

    if (isMinify) {
      return minifyNumber(overviewData.profit);
    }

    return overviewData.profit.toFixed(2);
  }, [isMinify, overviewData]);

  const unpaidAmount = useMemo(() => {
    if (!overviewData) {
      return 0;
    }

    if (isMinify) {
      return minifyNumber(overviewData.unpaidAmount);
    }

    return overviewData.unpaidAmount.toFixed(2);
  }, [isMinify, overviewData]);

  return (
    <>
      <Grid item xs={12} md={6} lg={4}>
        <OverviewCard
          icon={<AttachMoneyIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Revenue"
          backgroundColor={primary.lightest}
          // iconBackground={blue[50]}
          textColor={primary.main}
          value={revenue}
          extraTextIcon={
            overviewData?.revenueChange > 0 ? (
              <ArrowUpwardIcon fontSize="small" sx={{ color: green[500] }} />
            ) : (
              <ArrowDownwardIcon fontSize="small" sx={{ color: red[500] }} />
            )
          }
          extraText={{
            text: `${overviewData?.revenueChange?.toFixed(2)}%`,
            color: overviewData?.revenueChange > 0 ? green[500] : red[500],
          }}
          extraTextStyle={{
            fontSize: 'small',
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <OverviewCard
          icon={<PaymentIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Expenses"
          backgroundColor={primary.lightest}
          // iconBackground={blue[50]}
          textColor={primary.main}
          value={expenses}
          extraTextIcon={
            overviewData?.expensesChange > 0 ? (
              <ArrowUpwardIcon fontSize="small" sx={{ color: red[500] }} />
            ) : (
              <ArrowDownwardIcon fontSize="small" sx={{ color: green[500] }} />
            )
          }
          extraText={{
            text: `${overviewData?.expensesChange?.toFixed(2)}%`,
            color: overviewData?.expensesChange > 0 ? red[500] : green[500],
          }}
          extraTextStyle={{
            fontSize: 'small',
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <OverviewCard
          icon={<LocalAtmIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Profit"
          backgroundColor={primary.lightest}
          // iconBackground={blue[50]}
          textColor={primary.main}
          value={profit}
          extraTextIcon={
            overviewData?.profitChange > 0 ? (
              <ArrowUpwardIcon fontSize="small" sx={{ color: green[500] }} />
            ) : (
              <ArrowDownwardIcon fontSize="small" sx={{ color: red[500] }} />
            )
          }
          extraText={{
            text: `${overviewData?.profitChange?.toFixed(2)}%`,
            color: overviewData?.profitChange > 0 ? green[500] : red[500],
          }}
          extraTextStyle={{
            fontSize: 'small',
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <OverviewCard
          icon={<ReceiptLongIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Total Orders"
          backgroundColor={primary.lightest}
          // iconBackground={primary}
          textColor={primary.main}
          value={overviewData?.numberOfOrders || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <OverviewCard
          icon={<LoopIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Ongoing Orders"
          backgroundColor={primary.lightest}
          // iconBackground={blue[50]}
          textColor={primary.main}
          value={overviewData?.ongoingOrders || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <OverviewCard
          icon={<MoneyOffIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Unpaid Amount"
          backgroundColor={primary.lightest}
          // iconBackground={blue[50]}
          textColor={primary.main}
          value={unpaidAmount}
        />
      </Grid>
    </>
  );
}
