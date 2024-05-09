import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
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
import { Notification, OrderedItems } from '@/app/utils/type';
import { errorColor, infoColor } from '@/app/theme/color';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';
import { UpdateOption } from '@/pages/api/admin/orderedItems/PUT';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import UpdateChoiceSelection from '../UpdateChoiceSelection';

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
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newItem, setNewItem] = useState<Item>({
    name: '',
    price: 0,
    quantity: 0,
    totalPrice: 0,
  });
  const [updatedDate, setUpdatedDate] = useState<string>(order.deliveryDate);
  const [updateOption, setUpdateOption] = useState<UpdateOption>(
    UpdateOption.NONE,
  );
  const [status, setStatus] = useState<ORDER_STATUS>(order.status);

  const addNewItem = () => {
    const newItemName = newItem.name.toUpperCase();
    const hasNameExisted = itemList.some(
      (item: OrderedItems) => item.name === newItemName,
    );

    if (newItem.name.trim() === '') {
      setNotification({
        on: true,
        type: 'error',
        message: 'Item Name Is Missing',
      });
      return;
    }

    if (hasNameExisted) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Item Name Existed Already',
      });
    } else {
      const totalPrice = newItem.quantity * newItem.price;
      setItemList([...itemList, { ...newItem, totalPrice, name: newItemName }]);
      setNewItem({
        name: '',
        price: 0,
        quantity: 0,
        totalPrice: 0,
      });
    }
  };

  const handleDateChange = (e: any) => {
    const formattedDate: string = formatDateChanged(e);
    setUpdatedDate(formattedDate);
  };

  const handleChangeItem = (e: any, targetItem: Item, keyChange: string) => {
    e.preventDefault();
    const newItemList = itemList.map((item: Item) => {
      if (item.id === targetItem.id) {
        if (keyChange === 'quantity') {
          const totalPrice = item.price * +e.target.value;
          return { ...item, quantity: +e.target.value, totalPrice };
        }
        if (keyChange === 'price') {
          const totalPrice = item.quantity * +e.target.value;
          return { ...item, price: +e.target.value, totalPrice };
        }
        return item;
      }

      return item;
    });

    setItemList(newItemList);
  };

  const handleNewItemOnChange = (key: string, value: any) => {
    setNewItem({ ...newItem, [key]: value });
  };

  const calculateNewTotalPrice = () => {
    const totalPrice = itemList.reduce((acc: number, cV: any) => {
      return acc + cV.totalPrice;
    }, 0);

    return totalPrice;
  };

  const handleUpdateItems = async () => {
    try {
      setIsSubmitting(true);
      const totalPrice = calculateNewTotalPrice();
      const response = await axios.put(API_URL.ORDERED_ITEMS, {
        updatedItems: [...itemList],
        orderTotalPrice: totalPrice,
        orderId: order.id,
        updateOption,
        categoryName: newCategoryName,
        userId: order.userId,
        userCategoryId: order.categoryId,
      });

      if (response.data.error) {
        setIsSubmitting(false);
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleUpdateOrderUI({
        ...order,
        items: itemList,
        totalPrice,
      });

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsSubmitting(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update item: ' + error,
      });
    }
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
      } else {
        setNotification({
          on: true,
          type: 'warning',
          message: 'None of fields has updated yet',
        });
      }

      handleUpdateOrderUI({
        ...order,
        deliveryDate: updatedDate,
        status,
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
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update order: ' + error,
      });
    }
  };

  const removeItem = (itemName: string) => {
    const newItemList = itemList.filter((item: OrderedItems) => {
      return item.name !== itemName;
    });

    setItemList(newItemList);
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
          </Box>
          <Divider />
          <Box overflow="auto" maxHeight="70vh">
            <Grid container rowGap={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Delivery Date</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
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
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Status</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} textAlign="right">
                <LoadingButtonStyles
                  variant="contained"
                  disabled={itemList.length === 0}
                  loading={isSubmitting}
                  onClick={handleUpdateOrder}
                  color={infoColor}
                >
                  SAVE
                </LoadingButtonStyles>
              </Grid>
            </Grid>
            <Divider textAlign="center" sx={{ my: 3 }}>
              Add items
            </Divider>
            <Grid container spacing={3} mb={2}>
              <Grid item xs={12}>
                <UpdateChoiceSelection
                  updateOption={updateOption}
                  setUpdateOption={setUpdateOption}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="item-name-label">Item name</InputLabel>
                  <OutlinedInput
                    fullWidth
                    label="Item name"
                    value={newItem.name}
                    onChange={(e) =>
                      handleNewItemOnChange('name', e.target.value)
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="item-price-label">Unit price ($)</InputLabel>
                  <OutlinedInput
                    fullWidth
                    label="Unit price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) =>
                      handleNewItemOnChange('price', +e.target.value)
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="item-quantity-label">Quantity</InputLabel>
                  <OutlinedInput
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      handleNewItemOnChange('quantity', +e.target.value)
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" onClick={addNewItem}>
                  + Add
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Divider>Items</Divider>
              </Grid>
              {updateOption === UpdateOption.CREATE && (
                <>
                  <Grid container item xs={12} rowGap={1}>
                    <Typography variant="h6" fontWeight="bold">
                      New Category Name
                    </Typography>
                    <TextField
                      fullWidth
                      label="New category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </Grid>
                </>
              )}
              {itemList.length > 0 &&
                itemList.map((item: Item, index) => {
                  return (
                    <Fragment key={index}>
                      <Grid item xs={12} fontWeight="bold">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {item.name}
                          </Typography>
                          <IconButton onClick={() => removeItem(item.name)}>
                            <RemoveCircleIcon sx={{ color: errorColor }} />
                          </IconButton>
                        </Box>
                      </Grid>
                      <Grid item container columnSpacing={2}>
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
                      </Grid>
                    </Fragment>
                  );
                })}
              <Grid item xs={12} textAlign="right">
                <LoadingButtonStyles
                  variant="contained"
                  color={infoColor}
                  onClick={handleUpdateItems}
                  loading={isSubmitting}
                >
                  Save
                </LoadingButtonStyles>
              </Grid>
            </Grid>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
