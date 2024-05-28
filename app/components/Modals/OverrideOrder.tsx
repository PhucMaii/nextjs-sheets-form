import { Box, Button, Divider, Grid, Modal, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Item, Order } from '@/app/admin/orders/page';
import { BoxModal } from '../../admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { infoColor } from '@/app/theme/color';
import { Notification } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import LoadingButtonStyles from '../LoadingButtonStyles';

interface PropTypes extends ModalProps {
  currentItems: Item[];
  currentNote: string;
  lastOrder: Order;
  deliveryDate: string;
  setNotification: Dispatch<SetStateAction<Notification>>;
}
export default function OverrideOrder({
  open,
  onClose,
  currentItems,
  currentNote,
  lastOrder,
  deliveryDate,
  setNotification,
}: PropTypes) {
  const [isOverriding, setIsOverriding] = useState<boolean>(false);

  const handleOverrideOrder = async () => {
    try {
      setIsOverriding(true);

      const correctedIdItems = currentItems.map((item: Item) => {
        const sameItemName: any = lastOrder.items.find(
          (targetItem: Item) => item.name === targetItem.name,
        );

        return { ...item, id: sameItemName.id };
      });
      const response = await axios.put(API_URL.CLIENT_ORDER, {
        deliveryDate,
        note: currentNote,
        items: [...correctedIdItems],
        orderId: lastOrder.id,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsOverriding(false);
      }

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsOverriding(false);
      onClose();
    } catch (error: any) {
      console.log('Fail to override order: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to override order: ' + error,
      });
      setIsOverriding(false);
    }
  };

  return (
    <Modal open={open}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">
          You have already ordered for {deliveryDate}!
        </Typography>
        <Divider textAlign="center">Items</Divider>
        <Box overflow="auto" maxHeight="70vh">
          <Grid container rowGap={2}>
            {lastOrder.items &&
              lastOrder.items.length > 0 &&
              lastOrder.items.map((item: Item, index: number) => {
                return (
                  <Grid item container key={index}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <Typography variant="subtitle2">
                        ${item.price} per bag
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" fontWeight="bold">
                        Order: {item.quantity} bags - $
                        {(item.quantity * item.price).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })}
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                NOTE: {lastOrder.note || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6} onClick={onClose}>
            <Button fullWidth variant="outlined">
              Cancel
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <LoadingButtonStyles
              fullWidth
              loading={isOverriding}
              onClick={handleOverrideOrder}
              variant="contained"
              color={infoColor}
            >
              Override
            </LoadingButtonStyles>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
