import { primary } from '@/theme/color';
import { Grid } from '@mui/material';
import React, { useMemo } from 'react';
import OverviewCard from '../OverviewCard/OverviewCard';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaidIcon from '@mui/icons-material/Paid';
import MoneyIcon from '@mui/icons-material/Money';

interface IProps {
  codBoards: any;
}

export default function CodOverview({ codBoards }: IProps) {
  const totalBoards = useMemo(() => {
    if (!codBoards) {
      return [];
    }

    const boards = Object.keys(codBoards)
      .map((key) => {
        return codBoards[key];
      })
      .flat();

    return boards;
  }, [codBoards]);

  const cashInput = useMemo(() => {
    if (!codBoards) {
      return 0;
    }

    const amount = totalBoards.reduce((acc: number, board: any) => {
      return acc + board.cash;
    }, 0);

    return amount;
  }, [codBoards]);

  const expense = useMemo(() => {
    if (!codBoards) {
      return 0;
    }

    const amount = totalBoards.reduce((acc: number, board: any) => {
        if (board.expense) {
            return acc + board.expense.amount;
        }

        return acc;
    }, 0);

    return amount;
  }, [codBoards]);

  const unclearedAmount = useMemo(() => {
    if (!codBoards) {
      return 0;
    }

    const amount = totalBoards.reduce((acc: number, board: any) => {
      return acc + board.uncollected.amount;
    }, 0);

    return amount;
  }, [codBoards]);

  const totalAmount = useMemo(() => {
    if (!codBoards) {
      return 0;
    }

    const totalAmount = totalBoards.reduce((acc: number, board: any) => {
      return acc + board.totalAmount;
    }, 0);

    return totalAmount;
  }, [codBoards]);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3} sm={6}>
        <OverviewCard
          icon={<MoneyIcon fontSize="large" color="primary" />}
          text="Cash Input"
          value={cashInput.toFixed(2)}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
      <Grid item xs={12} md={3} sm={6}>
        <OverviewCard
          icon={<PaidIcon fontSize="large" color="primary" />}
          text="Expense"
          value={expense.toFixed(2)}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
      <Grid item xs={12} md={3} sm={6}>
        <OverviewCard
          icon={<MoneyOffIcon fontSize="large" color="primary" />}
          text="Uncleared Amount"
          value={unclearedAmount.toFixed(2)}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
      <Grid item xs={12} md={3} sm={6}>
        <OverviewCard
          icon={<LocalAtmIcon fontSize="large" color="primary" />}
          text="Total Amount"
          value={totalAmount.toFixed(2)}
          backgroundColor={primary.lightest}
          textColor={primary.main}
        />
      </Grid>
    </Grid>
  );
}
