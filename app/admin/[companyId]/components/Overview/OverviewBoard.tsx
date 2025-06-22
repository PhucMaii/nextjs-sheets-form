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
import { ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '../../orders/page';
import useFilterOrders from '@/hooks/useFilterOrders';
import PaidIcon from '@mui/icons-material/Paid';
import { PaymentStatus } from '@prisma/client';

export default function OverviewBoard({ boardData }: { boardData: IBoard }) {
  const orderWithoutVOID = useFilterOrders(boardData.orders, [
    ORDER_STATUS.INCOMPLETED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.COMPLETED,
  ]);
  const totalAmount = orderWithoutVOID.reduce((acc: number, order: Order) => {
    return acc + order.totalPrice;
  }, 0);

  const uncollectedOrders = useFilterOrders(boardData.orders, [
    PaymentStatus.Unpaid
  ], 'payment');

  const uncollectedAmount = uncollectedOrders.reduce(
    (acc: number, order: Order) => {
      return acc + order.totalPrice;
    },
    0,
  );

  const collectedOrders = useFilterOrders(boardData.orders, [
    PaymentStatus.Paid,
  ], 'payment');

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={4} xl={2.4}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<MoneyOffIcon fontSize="large" color="primary" />}
          text="Uncleared Amount"
          value={uncollectedAmount?.toFixed(2)}
          extraText={{
            text: `/${totalAmount}`,
            color: blueGrey[500],
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={2.4}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<ReceiptIcon fontSize="large" color="primary" />}
          text="Uncleared Orders"
          value={uncollectedOrders.length}
          extraText={{
            text: `/${boardData.orders.length}`,
            color: blueGrey[500],
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={2.4}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<PriceCheckIcon fontSize="large" color="primary" />}
          text="Cleared Orders"
          value={collectedOrders.length}
          extraText={{
            text: `/${boardData.orders.length}`,
            color: blueGrey[500],
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={2.4}>
        <OverviewCard
          textColor={primary.main}
          backgroundColor={primary.lightest}
          icon={<PaidIcon fontSize="large" color="primary" />}
          text="Expenses"
          value={
            (boardData?.expense && boardData?.expense[0]?.amount?.toFixed(2)) ||
            0
          }
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={2.4}>
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
