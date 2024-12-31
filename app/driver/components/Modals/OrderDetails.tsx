import React, { useState } from 'react';
import { BoxModal } from '@/app/admin/components/Modals/styled';
import OrderDetailsTable from '@/app/admin/components/Tables/OrderDetailsTable';
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Modal,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SellIcon from '@mui/icons-material/Sell';
import AssistantDirectionIcon from '@mui/icons-material/AssistantDirection';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { Order } from '@/app/admin/orders/page';
import { LoadingButton } from '@mui/lab';
import { ORDER_STATUS } from '@/app/utils/enum';
import { OrderedItems } from '@/app/utils/type';

interface IProps extends ModalProps {
  order: Order;
  totalQuantity: number;
  handleUpdateStatus: (
    orderId: number,
    updatedStatus: ORDER_STATUS,
  ) => Promise<void>;
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => Promise<void>;
  abilityToEdit: boolean;
}

export default function OrderDetails({
  open,
  onClose,
  order,
  totalQuantity,
  handleUpdateStatus,
  handleUpdateItem,
  abilityToEdit,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOnClick = async (updatedStatus: ORDER_STATUS) => {
    setIsLoading(true);
    await handleUpdateStatus(order.id, updatedStatus);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        gap={2}
        maxHeight="80vh"
        sx={{ overflowY: 'auto', overflowX: 'hidden', p: 2 }}
      >
        <Grid container alignItems="center">
          <Grid item xs={4}>
            <Typography variant="h6">#{order.id}</Typography>
          </Grid>
          <Grid item xs={4} textAlign="center">
            <Typography variant="h6">{order.clientName}</Typography>
          </Grid>
          <Grid item xs={4} textAlign="right">
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid item xs={10} md={6}>
            <Typography>Order at: {order.orderTime}</Typography>
          </Grid>
          <Grid item xs={2} textAlign="right">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${order.user.deliveryAddressLat},${order.user.deliveryAddressLng}`}
              target="_blank"
              aria-disabled={
                !order.user?.deliveryAddressLat ||
                !order.user?.deliveryAddressLng
              }
            >
              <AssistantDirectionIcon />
            </a>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <SellIcon color="primary" />
            <Typography color="primary" variant="subtitle1">
              {totalQuantity}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <LocalShippingIcon color="primary" />
            <Typography color="primary" variant="subtitle1">
              {order.deliveryDate}
            </Typography>
          </Box>
          <Button variant="outlined">${order.totalPrice.toFixed(2)}</Button>
        </Box>
        <Divider />
        <Grid container rowGap={4} columnSpacing={1} alignItems="flex-start">
          <Grid item textAlign="center" xs={12}>
            <Typography fontWeight="bold" variant="h6">
              ORDER
            </Typography>
            <OrderDetailsTable
              order={order}
              handleUpdateItem={handleUpdateItem}
              abilityToEdit={abilityToEdit}
            />
          </Grid>
          <Grid
            container
            item
            textAlign="center"
            alignItems="center"
            rowGap={2}
            xs={12}
          >
            <Grid item xs={12}>
              <Typography fontWeight="bold" variant="h6">
                NOTE
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                {order.note ? order.note : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          {abilityToEdit && <Box mt={2} position="sticky" bottom={0} sx={{ width: '100%' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <LoadingButton
                  onClick={() => handleOnClick(ORDER_STATUS.DELIVERED)}
                  loading={isLoading}
                  fullWidth
                  variant="contained"
                >
                  Delivered
                </LoadingButton>
              </Grid>
              <Grid item xs={6}>
                <LoadingButton
                  onClick={() => handleOnClick(ORDER_STATUS.COMPLETED)}
                  loading={isLoading}
                  color="success"
                  fullWidth
                  variant="contained"
                >
                  Collected
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>}
        </Grid>
      </BoxModal>
    </Modal>
  );
}
