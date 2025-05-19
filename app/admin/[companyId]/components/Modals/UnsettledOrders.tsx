import { AlertColor, Box, Grid, Modal, Typography } from '@mui/material';
import React from 'react';
import { ModalProps } from './type';
import OverviewCard from '../OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Order } from '../../orders/page';
import { BoxModal } from './styled';
import { primary } from '@/theme/color';
import OrderAccordion from '../OrderAccordion';

interface IProps extends ModalProps {
  orders: Order[];
  cashDiff: number;
  showNotification: (type: AlertColor, message: string) => void;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, targetOrder: Order) => void;
  mutateOrders: any;
}
export default function UnsettledOrders({
  open,
  onClose,
  cashDiff,
  orders,
  showNotification,
  handleSelectOrder,
  selectedOrders,
  mutateOrders,
}: IProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" maxHeight="80vh">
        <Typography variant="h5" textAlign="center">
          Unsettled Orders
        </Typography>

        {/* Overview */}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <OverviewCard
              icon={<ReceiptLongIcon color="primary" fontSize="large" />}
              text="Orders"
              value={orders.length}
              backgroundColor={primary['lightest']}
            />
          </Grid>
          <Grid item xs={6}>
            <OverviewCard
              icon={<MonetizationOnIcon color="primary" fontSize="large" />}
              text="Money Difference"
              value={cashDiff.toFixed(2)}
              backgroundColor={primary['lightest']}
            />
          </Grid>
        </Grid>
        {/* Orders */}
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ maxHeight: '75vh', overflow: 'auto' }}
          mt={2}
        >
          {orders.map((order, index) => (
            <OrderAccordion
              order={order}
              key={index}
              showNotification={showNotification}
              selectedOrders={selectedOrders}
              handleSelectOrder={handleSelectOrder}
              mutateOrders={mutateOrders}
            />
          ))}
        </Box>
      </BoxModal>
    </Modal>
  );
}
