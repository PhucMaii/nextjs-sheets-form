import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from './styled';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';
import { infoColor } from '@/app/theme/color';
import {
  Notification,
  OrderedItems,
  ScheduledOrder,
  UserType,
} from '@/app/utils/type';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import ErrorComponent from '../ErrorComponent';
import { LoadingButton } from '@mui/lab';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface PropTypes {
  client: UserType;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function ScheduledOrdersView({
  client,
  setNotification,
}: PropTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [order, setOrder] = useState<ScheduledOrder>({
    id: -1,
    userId: -1,
    totalPrice: 0,
    items: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchScheduledOrder();
    }
  }, [isOpen]);

  const fetchScheduledOrder = async () => {
    try {
      const response = await axios.get(
        `${API_URL.SCHEDULED_ORDER}?userId=${client.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'warning',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      setOrder(response.data.data);
      setIsFetching(false);
    } catch (error: any) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch schedule order: ' + error,
      });
      setIsFetching(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      setIsButtonLoading(true);
      const response = await axios.put(API_URL.SCHEDULED_ORDER, {
        items: order.items,
        scheduledOrderId: order.id,
        totalPrice: order.totalPrice,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsButtonLoading(false);
        return;
      }

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsButtonLoading(false);
    } catch (error: any) {
      console.log('Fail to update schedule order: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update schedule order: ' + error,
      });
      setIsButtonLoading(false);
    }
  };

  const handleOnChangeItem = (targetItem: OrderedItems, quantity: number) => {
    if (quantity < 0) {
      return;
    }

    let newTotalPrice = 0;
    const newItemList = order.items.map((item: OrderedItems) => {
      if (item.id === targetItem.id) {
        newTotalPrice += item.price * quantity;
        return { ...item, quantity };
      }

      newTotalPrice += item.price * item.quantity;
      return item;
    });

    setOrder({ ...order, items: newItemList, totalPrice: newTotalPrice });
  };

  const setUpScheduleOrder = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsButtonLoading(true);
      const response = await axios.post(API_URL.SCHEDULED_ORDER, {
        userId: client.id,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsButtonLoading(false);
        return;
      }

      setOrder(response.data.data);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsButtonLoading(false);
    } catch (error: any) {
      console.log('Fail to fetch schedule order: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch schedule order: ' + error,
      });
      setIsButtonLoading(false);
    }
  };

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)}>
        <FindInPageIcon sx={{ color: infoColor }} />
      </IconButton>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal display="flex" flexDirection="column" gap={2}>
          {isFetching ? (
            <LoadingComponent color="blue" />
          ) : (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h4">Edit Scheduled Order</Typography>
                <LoadingButtonStyles
                  variant="contained"
                  disabled={order.items.length === 0}
                  loading={isButtonLoading}
                  onClick={handleUpdateOrder}
                  color={infoColor}
                >
                  SAVE
                </LoadingButtonStyles>
              </Box>
              <Divider />
              <Grid container spacing={3}>
                {order.items.length > 0 ? (
                  order.items.map((item: OrderedItems, index: number) => {
                    return (
                      <Grid item xs={12} key={index}>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Typography variant="h6">{item.name}</Typography>
                          <TextField
                            fullWidth
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                              handleOnChangeItem(item, +e.target.value)
                            }
                            type="number"
                          />
                        </Box>
                      </Grid>
                    );
                  })
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                    sx={{ width: '100%', height: '100%' }}
                  >
                    <ErrorComponent errorText="No Schedule Order Yet" />
                    <LoadingButton
                      loading={isButtonLoading}
                      onClick={setUpScheduleOrder}
                    >
                      Set up schedule order
                    </LoadingButton>
                  </Box>
                )}
                <Grid item xs={12} textAlign="right">
                  <Typography variant="h6">
                    Total : ${order.totalPrice.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </BoxModal>
      </Modal>
    </>
  );
}
