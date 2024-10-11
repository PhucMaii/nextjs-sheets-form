import { Grid } from '@mui/material';
import React from 'react';
import OverviewCard from '../OverviewCard/OverviewCard';
import { primary } from '@/theme/color';
import { IBoard } from '@/app/utils/type';
import { blueGrey } from '@mui/material/colors';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import MoneyIcon from '@mui/icons-material/Money';
import ReceiptIcon from '@mui/icons-material/Receipt';

export default function OverviewBoard({ boardData }: { boardData: IBoard }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<MoneyOffIcon fontSize="large" color="primary" />}
          text="Uncleared Amount"
          value={boardData.uncollected.amount}
          extraText={{
            text: `/${boardData.totalAmount}`,
            color: blueGrey[500],
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<ReceiptIcon fontSize="large" color="primary" />}
          text="Uncleared Orders"
          value={boardData.uncollected.orders.length}
          extraText={{
            text: `/${boardData.orders.length}`,
            color: blueGrey[500],
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<PriceCheckIcon fontSize="large" color="primary" />}
          text="Cleared Orders"
          value={boardData.collected.orders.length}
          extraText={{
            text: `/${boardData.orders.length}`,
            color: blueGrey[500],
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<MoneyIcon fontSize="large" color="primary" />}
          text="Cash Input"
          value={boardData.cash}
        />
      </Grid>
    </Grid>
  );
}
