import StatusText from '@/app/admin/components/StatusText';
import { ShadowSection } from '@/app/admin/reports/styled';
import { Box, Button, Fab, Grid, IconButton, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SellIcon from '@mui/icons-material/Sell';
import AssistantDirectionIcon from '@mui/icons-material/AssistantDirection';
import { Item, Order } from '@/app/admin/orders/page';
import PreviewIcon from '@mui/icons-material/Preview';
import OrderDetails from './OrderDetails';

interface IProps {
  order: Order;
}

export default function OrderComponent({
  order
}: IProps) {
  const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);

  const totalQuantity = useMemo(() => {
    if (!order.items || order.items.length === 0) {
      return 0;
    }

    const quantity = order.items.reduce((acc: number, item: Item) => {
      return acc + item.quantity;
    }, 0);

    return quantity;
  }, [order]);

  return (
    <ShadowSection mt={1}>
      <OrderDetails
        open={isOpenDetails}
        onClose={() => setIsOpenDetails(false)}
        order={order}
        totalQuantity={totalQuantity}
      />
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={8}>
          <StatusText text={order.status} type="warning" />
        </Grid>
        <Grid item xs={4} textAlign="right">
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
          >
            <Fab sx={{zIndex: 0}} color="primary" size="small">
              <LocalShippingIcon />
            </Fab>
            <Fab sx={{zIndex: 0}} color="success" size="small">
              <CreditScoreIcon />
            </Fab>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1">#{order.id}</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <IconButton onClick={() => setIsOpenDetails(true)}>
              <PreviewIcon color="primary" />
            </IconButton>
            <IconButton onClick={() => setIsOpenDetails(true)}>
              <AssistantDirectionIcon color="primary" />
            </IconButton>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1">
            Order at: {order.orderTime}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1">Delivery Date: {order.deliveryDate}</Typography>
        </Grid>
        <Grid item textAlign="center" xs={12}>
          <Button variant="contained">{order.user.clientName}</Button>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" gap={1} alignItems="center">
              <SellIcon color="primary" />
              <Typography color="primary" variant="subtitle1">
                {totalQuantity}
              </Typography>
            </Box>
            <Button variant="outlined">${order.totalPrice.toFixed(2)}</Button>
          </Box>
        </Grid>
      </Grid>
    </ShadowSection>
  );
}
