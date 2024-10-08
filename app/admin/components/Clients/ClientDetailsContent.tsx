import { Box, Grid } from '@mui/material';
import React, { useMemo } from 'react';
import ClientOrderOverview from './ClientOrderOverview';
import { normalizeDate, sortByDeliveryDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import AreaChart from '../Charts/AreaChart';
import { ShadowSection } from '../../reports/styled';
import ClientOrderSummary from './ClientOrderSummary';
import ManifestTable from '../Tables/ManifestTable';
import { generateManifest } from '@/pages/api/admin/orders/overview';

interface IProps {
  orders: any;
  dateRange: any;
}

export default function ClientDetailsContent({ orders, dateRange }: IProps) {
  const listOfDateString = useMemo(() => {
    const normalizedStartDate = normalizeDate(new Date(dateRange[0]));
    const normalizedEndDate = normalizeDate(new Date(dateRange[1]));
    const dateStringList = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    return dateStringList;
  }, [dateRange]);

  const totalSpendBasedOnDate = useMemo(() => {
    if (orders.length === 0) {
      return [];
    }

    const nonVoidOrders = orders.filter(
      (order: any) => order.status !== 'VOID',
    );
    const sortedOrders = sortByDeliveryDate(nonVoidOrders);

    const returnList = [];

    let dateListIndex = 0;
    let orderListIndex = 0;

    while (dateListIndex < listOfDateString.length) {
      const date = listOfDateString[dateListIndex];
      const dateOrder = sortedOrders[orderListIndex];

      if (dateOrder?.deliveryDate === date) {
        returnList.push(dateOrder.totalPrice);
        orderListIndex++;
      } else {
        returnList.push(0);
      }

      dateListIndex++;
    }
    return returnList;
  }, [orders, listOfDateString]);

  const itemManifest = useMemo(() => {
    const totalSpend = orders.reduce((acc: number, order: any) => {
      if (order.status !== 'VOID') {
        return acc + order.totalPrice;
      }
      return acc;
    }, 0);

    return generateManifest(orders, totalSpend);
  }, [orders]);

  return (
    <Box m={2} pr={6}>
      <ClientOrderOverview
        clientOrders={orders}
        startDate={dateRange[0]}
        endDate={dateRange[1]}
      />

      <ShadowSection width="100%" my={2} sx={{ height: 365 }}>
        <AreaChart
          timeSeries={listOfDateString}
          thisMonthData={totalSpendBasedOnDate}
        />
      </ShadowSection>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ClientOrderSummary orders={orders} />
        </Grid>
        <Grid item xs={12} md={8}>
          <ManifestTable manifest={itemManifest} isAdmin />
        </Grid>
      </Grid>
    </Box>
  );
}
