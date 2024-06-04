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
import UpdateChoiceSelection from '../UpdateChoiceSelection';
import { UpdateOption } from '@/pages/api/admin/orderedItems/PUT';
import {
  Notification,
  OrderedItems,
  IRoutes,
  ScheduledOrder,
} from '@/app/utils/type';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { errorColor, infoColor } from '@/app/theme/color';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';
import { API_URL } from '@/app/utils/enum';
import axios from 'axios';

interface PropTypes {
  order: ScheduledOrder;
  setNotification: Dispatch<SetStateAction<Notification>>;
  handleUpdateOrderUI: (updatedOrder: ScheduledOrder) => void;
  handleDeleteOrderUI: (targetOrder: ScheduledOrder) => void;
  routes: IRoutes[];
  routeId: number;
}

export default function EditScheduleOrder({
  order,
  handleUpdateOrderUI,
  setNotification,
  handleDeleteOrderUI,
  routes,
  routeId,
}: PropTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<OrderedItems>({
    name: '',
    price: 0,
    quantity: 0,
    totalPrice: 0,
  });
  const [newRouteId, setNewRouteId] = useState<number>(routeId);
  const [itemList, setItemList] = useState<OrderedItems[]>(() => {
    const formattedItems = order.items.map((item: OrderedItems) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });
    return formattedItems;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updateOption, setUpdateOption] = useState<UpdateOption>(
    UpdateOption.NONE,
  );

  const addNewItem = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
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

  const calculateNewTotalPrice = () => {
    const totalPrice = itemList.reduce((acc: number, cV: any) => {
      return acc + cV.totalPrice;
    }, 0);

    return totalPrice;
  };

  const handleChangeItem = (
    e: any,
    targetItem: OrderedItems,
    keyChange: string,
  ) => {
    e.preventDefault();
    const newItemList = itemList.map((item: OrderedItems) => {
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

  const removeItem = (itemName: string) => {
    const newItemList = itemList.filter((item: OrderedItems) => {
      return item.name !== itemName;
    });

    setItemList(newItemList);
  };

  const switchRoute = async () => {
    if (newRouteId === routeId) {
      setNotification({
        on: true,
        type: 'warning',
        message: 'Route Has Not Been Changed',
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.put(API_URL.SCHEDULED_ORDER, {
        user: order.user,
        oldRouteId: routeId,
        newRouteId,
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

      handleDeleteOrderUI(order);

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

  const updateItems = async () => {
    try {
      setIsSubmitting(true);
      const totalPrice = calculateNewTotalPrice();
      const response = await axios.put(API_URL.SCHEDULED_ORDER, {
        user: order.user,
        items: itemList,
        scheduledOrderId: order.id,
        totalPrice,
        updateOption,
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
        <BoxModal
          overflow="auto"
          maxHeight="100vh"
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">Edit Order</Typography>
          </Box>
          <Divider />
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Route:</Typography>
            <Select
              value={newRouteId}
              onChange={(e) => setNewRouteId(+e.target.value)}
              fullWidth
            >
              {routes &&
                routes.map((route: IRoutes) => {
                  return (
                    <MenuItem key={route.id} value={route.id}>
                      {route.name} - {route?.driver?.name}
                    </MenuItem>
                  );
                })}
            </Select>
            <Box display="flex" justifyContent="right">
              <LoadingButtonStyles
                variant="contained"
                color={infoColor}
                onClick={switchRoute}
                loading={isSubmitting}
              >
                Save
              </LoadingButtonStyles>
            </Box>
          </Box>
          <Divider textAlign="center" sx={{ mb: 1 }}>
            Add items
          </Divider>
          <Box overflow="auto" maxHeight="70vh">
            <Grid container spacing={3} mb={2}>
              <Grid item xs={12}>
                <UpdateChoiceSelection
                  updateOption={updateOption}
                  setUpdateOption={setUpdateOption}
                  noCreate
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
              {itemList.length > 0 &&
                itemList.map((item: OrderedItems, index) => {
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
                  onClick={updateItems}
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
