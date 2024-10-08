import React from 'react';
import { ShadowSection } from '../../reports/styled';
import { Box, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import useFilterOrders from '@/hooks/useFilterOrders';
import { ORDER_STATUS } from '@/app/utils/enum';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '@/theme/color';

interface IProps {
  orders: any;
}

export default function ClientOrderSummary({ orders }: IProps) {
  const incompletedOrders = useFilterOrders(orders, [ORDER_STATUS.INCOMPLETED]);
  const completedOrders = useFilterOrders(orders, [ORDER_STATUS.COMPLETED]);
  const deliveredOrders = useFilterOrders(orders, [ORDER_STATUS.DELIVERED]);
  const voidedOrders = useFilterOrders(orders, [ORDER_STATUS.VOID]);

  const orderSummaryData = [
    {
      color: warningColor,
      text: 'Incompleted',
      value: incompletedOrders.length,
    },
    {
      color: infoColor,
      text: 'Delivered',
      value: deliveredOrders.length,
    },
    {
      color: successColor,
      text: 'Completed',
      value: completedOrders.length,
    },
    {
      color: errorColor,
      text: 'Voided',
      value: voidedOrders.length,
    },
  ];

  return (
    <ShadowSection>
      <Typography variant="subtitle1">Order Summary</Typography>

      <Box display="flex" flexDirection="column" my={3}>
        <Typography variant="h4">{orders.length}</Typography>
        <Typography variant="subtitle2" color={grey[500]}>
          Total Orders
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {orderSummaryData.map(({ color, text, value }, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="row"
            gap={1}
            justifyContent={'space-between'}
            alignItems="center"
          >
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
              <Box
                sx={{
                  backgroundColor: color,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                }}
              />
              <Typography variant="subtitle1" fontWeight={400}>
                {text}
              </Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight={'bold'}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </ShadowSection>
  );
}
