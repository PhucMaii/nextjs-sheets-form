import React, { Dispatch, SetStateAction, useState } from 'react';
import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { Item, Order } from '@/app/admin/orders/page';
import { infoColor } from '@/app/theme/color';
import { Notification } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface PropTypes extends ModalProps {
  order: Order;
  setNotification: Dispatch<SetStateAction<Notification>>;
  handleUpdateOrderUI: (updatedOrder: Order) => void;
}

export default function EditOrder({
  open,
  onClose,
  order,
  setNotification,
  handleUpdateOrderUI,
}: PropTypes) {
  const [itemList, setItemList] = useState<Item[]>(
    (order.items as Item[]) || [],
  );
  const [isOverriding, setIsOverriding] = useState<boolean>(false);
  const [note, setNote] = useState<string>(order.note || '');

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const handleChangeItem = (e: any, itemId: number) => {
    const newItemList = itemList.map((item: Item) => {
      if (item.id === itemId) {
        return { ...item, quantity: +e.target.value };
      }
      return item;
    });

    setItemList(newItemList);
  };

  const handleOverrideOrder = async () => {
    try {
      setIsOverriding(true);

      const response = await axios.put(API_URL.CLIENT_ORDER, {
        deliveryDate: order.deliveryDate,
        note,
        items: [...itemList],
        orderId: order.id,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsOverriding(false);
      }

      handleUpdateOrderUI(response.data.data);
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
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Override Order</Typography>
          {!mdDown && (
            <LoadingButton
              variant="contained"
              disabled={itemList.length === 0}
              loading={isOverriding}
              onClick={handleOverrideOrder}
              sx={{
                backgroundColor: `${infoColor} !important`,
                '& .css-1yt7yx7-MuiLoadingButton-loadingIndicator': {
                  color: 'white', // Change the color to white
                },
              }}
            >
              SAVE
            </LoadingButton>
          )}
        </Box>
        <Divider />
        <Box overflow="auto" maxHeight="70vh">
          <Grid container rowGap={3}>
            {itemList.length > 0 &&
              itemList.map((item: Item) => {
                return (
                  <Grid key={item.id} container item spacing={1}>
                    <Grid item xs={12}>
                      {item.name} - ${item.price}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleChangeItem(e, item.id)}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            <Grid container item spacing={1}>
              <Grid item xs={12}>
                NOTE
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Grid>
            </Grid>
            {mdDown && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button variant="outlined" onClick={onClose}>
                    Cancel
                  </Button>
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    disabled={itemList.length === 0}
                    loading={isOverriding}
                    onClick={handleOverrideOrder}
                  >
                    SAVE
                  </LoadingButton>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </BoxModal>
    </Modal>
  );
}
