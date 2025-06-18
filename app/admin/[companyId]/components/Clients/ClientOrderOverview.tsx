import { Grid } from '@mui/material';
import React, { useMemo } from 'react';
import OverviewCard from '../OverviewCard/OverviewCard';
import { primary } from '@/theme/color';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaidIcon from '@mui/icons-material/Paid';
import useFilterOrders from '@/hooks/useFilterOrders';
import { PaymentStatus } from '@prisma/client';

interface IProps {
  clientOrders: any;
  startDate: Date;
  endDate: Date;
}

export default function ClientOrderOverview({
  clientOrders,
  startDate,
  endDate,
}: IProps) {
  const totalSpend = useMemo(() => {
    if (clientOrders.length === 0) {
      return 0;
    }

    return clientOrders?.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);
  }, [clientOrders, startDate, endDate]);

  const totalProfit = useMemo(() => {
    if (clientOrders.length === 0) {
      return 0;
    }

    return clientOrders?.reduce((acc: number, order: any) => {
      return acc + (order?.profit || 0);
    }, 0);
  }, [clientOrders, startDate, endDate]);

  const averageProfit = useMemo(() => {
    return (totalProfit / clientOrders.length)?.toFixed(2);
  }, [clientOrders, startDate, endDate]);

  const unpaidOrders = useFilterOrders(clientOrders, [
    PaymentStatus.Unpaid,
  ], 'payment');

  const unpaidAmount = useMemo(() => {
    return unpaidOrders.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);
  }, [unpaidOrders]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          icon={<PaidIcon fontSize="large" color={'primary'} />}
          text="Revenue"
          value={`$${totalSpend.toFixed(2)}`}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          icon={<PriceChangeIcon fontSize="large" color={'primary'} />}
          text="Profit"
          value={`$${totalProfit.toFixed(2)}`}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          icon={<PriceChangeIcon fontSize="large" color={'primary'} />}
          text="Average Profit / Order"
          value={`$${averageProfit}`}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          icon={<MoneyOffIcon fontSize="large" color={'primary'} />}
          text="Unpaid Amount"
          value={`$${unpaidAmount.toFixed(2)}`}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
    </Grid>
  );
}
