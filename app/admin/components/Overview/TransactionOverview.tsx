import { Grid } from '@mui/material';
import React, { useMemo } from 'react';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PaidIcon from '@mui/icons-material/Paid';
import OverviewCard from '../OverviewCard/OverviewCard';
import MoneyIcon from '@mui/icons-material/Money';
import { primary } from '@/theme/color';
import { IExpense } from '@/app/utils/type';

interface IProps {
  transactions: IExpense[];
}

export default function TransactionOverview({ transactions }: IProps) {
  const totalBill = useMemo(() => {
    if (transactions.length === 0) {
      return 0;
    }
    return transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );
  }, [transactions]);

  const avgSpendPerDay = useMemo(() => {
    if (totalBill === 0) {
      return 0;
    }

    const transactionDays = transactions.map((transaction) => {
      return transaction.date;
    });

    const spendingDay = new Set(transactionDays);

    return Math.floor(totalBill / spendingDay.size);
  }, [totalBill]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<PointOfSaleIcon fontSize="large" color="primary" />}
          text="Total Transactions"
          value={transactions.length || 0}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<PaidIcon fontSize="large" color="primary" />}
          text="Total Bill"
          value={totalBill.toFixed(2) || 0}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<MoneyIcon fontSize="large" color="primary" />}
          text="Avg Spend Per Day"
          value={avgSpendPerDay.toFixed(2) || 0}
        />
      </Grid>
    </Grid>
  );
}
