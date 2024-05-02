import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { BoxModal } from './styled';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Item, Order } from '../../orders/page';
import { formatDateChanged } from '@/app/utils/time';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import { Notification } from '@/app/utils/type';
import { infoColor } from '@/app/theme/color';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';

interface PropTypes {
  order: Order;
  handleUpdateOrderUI: (updatedOrder: Order) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function EditReportOrder({
  order,
  handleUpdateOrderUI,
  setNotification,
}: PropTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [itemList, setItemList] = useState<Item[]>([...order.items]);
  const [updatedDate, setUpdatedDate] = useState<string>(order.deliveryDate);
  const [status, setStatus] = useState<ORDER_STATUS>(order.status);

  const handleDateChange = (e: any) => {
    const formattedDate: string = formatDateChanged(e);
    setUpdatedDate(formattedDate);
  };

  const handleChangeItem = (e: any, targetItem: Item, keyChange: string) => {
    e.preventDefault();
    const newItemList = itemList.map((item: Item) => {
      if (item.id === targetItem.id) {
        if (keyChange === 'quantity') {
          return { ...item, quantity: +e.target.value };
        }
        if (keyChange === 'price') {
          return { ...item, price: +e.target.value };
        }
        return item;
      }

      return item;
    });

    setItemList(newItemList);
  };

  const handleUpdateOrder = async () => {
    try {
      setIsSubmitting(true);
      if (updatedDate !== order.deliveryDate || status !== order.status) {
        const orderUpdateResponse = await axios.put(API_URL.ORDER, {
          orderId: order.id,
          deliveryDate: updatedDate,
          status,
        });

        if (orderUpdateResponse.data.error) {
          setNotification({
            on: true,
            type: 'error',
            message:
              'Fail to update date and status: ' +
              orderUpdateResponse.data.error,
          });
          setIsSubmitting(false);
          return;
        }
      }

      const newOrderTotalPrice = itemList.reduce((acc: number, cV: Item) => {
        return acc + cV.price * cV.quantity;
      }, 0);

      const itemUpdateResponse = await axios.put(API_URL.ORDERED_ITEMS, {
        orderId: order.id,
        updatedItems: itemList,
        orderTotalPrice: newOrderTotalPrice,
      });

      if (itemUpdateResponse.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message:
            'Fail to update date and status: ' + itemUpdateResponse.data.error,
        });
        setIsSubmitting(false);
        return;
      }

      handleUpdateOrderUI({
        ...order,
        deliveryDate: updatedDate,
        status,
        items: itemList,
        totalPrice: newOrderTotalPrice,
      });
      setNotification({
        on: true,
        type: 'success',
        message: 'Update Order Successfully',
      });
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update order: ', error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        Edit
      </Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal display="flex" flexDirection="column" gap={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">Edit Order</Typography>
            <LoadingButtonStyles
              variant="contained"
              disabled={itemList.length === 0}
              loading={isSubmitting}
              onClick={handleUpdateOrder}
              color={infoColor}
            >
              SAVE
            </LoadingButtonStyles>
          </Box>
          <Divider />
          <Box overflow="auto" maxHeight="70vh">
            <Grid container rowGap={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Delivery Date</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Edit Date"
                      value={dayjs(updatedDate)}
                      onChange={(e: any) => handleDateChange(e)}
                      sx={{
                        width: '100%',
                        height: '0.1%',
                        borderRadius: 2,
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                Status
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="select-status">Status</InputLabel>
                  <Select
                    labelId="select-status"
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as ORDER_STATUS)}
                  >
                    <MenuItem value={ORDER_STATUS.COMPLETED}>
                      Completed
                    </MenuItem>
                    <MenuItem value={ORDER_STATUS.DELIVERED}>
                      Delivered
                    </MenuItem>
                    <MenuItem value={ORDER_STATUS.INCOMPLETED}>
                      Incompleted
                    </MenuItem>
                    <MenuItem value={ORDER_STATUS.VOID}>Void</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Divider textAlign="center" sx={{ my: 2 }}>
              Items
            </Divider>
            <Grid container rowGap={3}>
              {itemList.length > 0 &&
                itemList.map((item: Item, index) => {
                  return (
                    <Fragment key={index}>
                      <Grid item xs={12} fontWeight="bold">
                        {item.name}
                      </Grid>
                      <Grid item container columnSpacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                              handleChangeItem(e, item, 'quantity')
                            }
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <TextField
                            fullWidth
                            label="Unit Price ($)"
                            value={item.price}
                            onChange={(e) => handleChangeItem(e, item, 'price')}
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                        </Grid>
                      </Grid>
                    </Fragment>
                  );
                })}
            </Grid>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
