import {
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { BoxModal } from './styled';
import { Notification, OrderedItems } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { Item, Order } from '../../orders/page';
import { ModalProps } from './type';
import { LoadingButton } from '@mui/lab';

interface PropTypes extends ModalProps {
  order: Order;
  item: OrderedItems;
  updateUIItem: (targetOrder: Order, targetItem: Item) => void;
  setItem: Dispatch<SetStateAction<OrderedItems>>;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function EditItemModal({
  open,
  onClose,
  order,
  item,
  updateUIItem,
  setItem,
  setNotification,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUpdateData = async () => {
    setIsLoading(true);
    try {
      const orderTotalPrice = calculateNewTotalPrice();
      const response = await axios.put(`${API_URL.ORDERED_ITEMS}/single`, {
        ...item,
        orderId: order.id,
        orderTotalPrice,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsLoading(false);
        return;
      }

      updateUIItem(order, response.data.data);

      setNotification({
        on: true,
        type: 'success',
        message: 'Update Item Successfully',
      });
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to update order items: ', error);
      setIsLoading(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update order items: ' + error,
      });
    }
  };

  const calculateNewTotalPrice = () => {
    const totalPrice = order.items.reduce((acc: number, cV: Item) => {
      if (cV.id === item.id) {
        return acc + item.totalPrice;
      }
      return acc + cV.totalPrice;
    }, 0);
    return totalPrice;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{item.name}</Typography>
          <LoadingButton
            variant="contained"
            loadingIndicator="Saving..."
            loading={isLoading}
            onClick={handleUpdateData}
          >
            Save
          </LoadingButton>
        </Box>
        <Divider />
        <Grid container alignItems="center" rowGap={4} mt={2}>
          <Grid item xs={6}>
            <Typography variant="h6">Quantity</Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Quantity"
              value={item.quantity}
              type="number"
              onChange={(e: any) =>
                setItem((prevOrder: OrderedItems) => ({
                  ...prevOrder,
                  quantity: +e.target.value,
                  totalPrice: prevOrder.price * +e.target.value,
                }))
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Unit Price</Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Quantity"
              value={item.price}
              onChange={(e: any) =>
                setItem((prevOrder: OrderedItems) => ({
                  ...prevOrder,
                  price: +e.target.value,
                  totalPrice: prevOrder.quantity * +e.target.value,
                }))
              }
              fullWidth
              type="number"
            />
          </Grid>
        </Grid>
        <Divider />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Total Price</Typography>
          <Typography variant="h6">{item.totalPrice.toFixed(2)}</Typography>
        </Box>
      </BoxModal>
    </Modal>
  );
}
