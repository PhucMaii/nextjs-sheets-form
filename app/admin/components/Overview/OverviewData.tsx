import React, { useMemo } from 'react';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LoopIcon from '@mui/icons-material/Loop';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { Grid } from '@mui/material';
import { primary, primaryColor } from '@/theme/color';
import { minifyNumber } from '@/app/utils/number';
import OverviewCard from '../OverviewCard/OverviewCard';

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
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<ReceiptLongIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Total Orders"
          backgroundColor={primary.lightest}
          // iconBackground={primary}
          textColor={primary.main}
          value={overviewData?.numberOfOrders || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<AttachMoneyIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Revenue"
          backgroundColor={primary.lightest}
          // iconBackground={blue[50]}
          textColor={primary.main}
          value={revenue}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<LoopIcon sx={{ color: primaryColor, fontSize: 50 }} />}
          text="Ongoing Orders"
          backgroundColor={primary.lightest}
          // iconBackground={blue[50]}
          textColor={primary.main}
          value={overviewData?.ongoingOrders || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
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
