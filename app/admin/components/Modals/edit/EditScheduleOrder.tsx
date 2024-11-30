import {
  AlertColor,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { UpdateOption } from '@/pages/api/admin/orderedItems/PUT';
import { OrderedItems, IRoutes, ScheduledOrder } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';

interface IProps {
  order: ScheduledOrder;
  showNotification: (type: AlertColor, message: string) => void;
  handleUpdateOrderUI: (updatedOrder: ScheduledOrder) => void;
  handleDeleteOrderUI: (targetOrder: ScheduledOrder) => void;
  routes: IRoutes[];
  routeId: number;
  mutateOrders: any;
}

export default function EditScheduleOrder({
  order,
  handleUpdateOrderUI,
  showNotification,
  handleDeleteOrderUI,
  routes,
  routeId,
  mutateOrders,
}: IProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // const [newItem, setNewItem] = useState<any>({
  //   name: '',
  //   price: 0,
  //   quantity: 0,
  //   totalPrice: 0,
  //   inventoryItemId: -1,
  // });
  const [newRouteId, setNewRouteId] = useState<number>(routeId);
  const [itemList, setItemList] = useState<OrderedItems[]>(() => {
    const formattedItems = order.items.map((item: OrderedItems) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });
    return formattedItems;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updateOption] = useState<UpdateOption>(
    UpdateOption.NONE,
  );

  useEffect(() => {
    const formattedItems = order.items.map((item: OrderedItems) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });
    
    setItemList(formattedItems);
  }, [order]);

  // const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  // const addNewItem = (e: any) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   if (newItem.inventoryItemId === -1) {
  //     showNotification('error', 'Inventory Item Is Missing');
  //     return;
  //   }

  //   const newItemName = newItem.name.toUpperCase();
  //   const hasNameExisted = itemList.some(
  //     (item: OrderedItems) =>
  //       item.name === newItemName ||
  //       item.inventoryItemId === newItem.inventoryItemId,
  //   );

  //   if (newItem.name.trim() === '') {
  //     showNotification('error', 'Item Name Is Missing');
  //     return;
  //   }

  //   if (hasNameExisted) {
  //     showNotification('error', 'Inventory Item Existed Already');
  //   } else {
  //     const totalPrice = newItem.quantity * newItem.price;
  //     setItemList([...itemList, { ...newItem, totalPrice, name: newItemName }]);
  //     setNewItem({
  //       name: '',
  //       price: 0,
  //       quantity: 0,
  //       totalPrice: 0,
  //     });
  //   }
  // };

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

  // const handleNewItemOnChange = (key: string, value: any) => {
  //   setNewItem({ ...newItem, [key]: value });
  // };

  // const removeItem = (itemName: string) => {
  //   const newItemList = itemList.filter((item: OrderedItems) => {
  //     return item.name !== itemName;
  //   });

  //   setItemList(newItemList);
  // };

  const switchRoute = async () => {
    if (newRouteId === routeId) {
      showNotification('warning', 'Route Has Not Been Changed');
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
        showNotification('error', response.data.error);
        return;
      }

      handleDeleteOrderUI(order);

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsSubmitting(false);
      showNotification('error', 'Fail to update item: ' + error);
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
        showNotification('error', response.data.error);
        return;
      }

      handleUpdateOrderUI({
        ...order,
        items: itemList,
        totalPrice,
      });

      mutateOrders();

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsSubmitting(false);
      showNotification('error', 'Fail to update item: ' + error);
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
          maxHeight="80vh"
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
              <LoadingButton
                variant="contained"
                onClick={switchRoute}
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Box>
          </Box>
          {/* <Divider textAlign="center" sx={{ mb: 1 }}>
            Add items
          </Divider> */}
          <Box>
            <Grid container spacing={3} mb={2}>
              {/* <Grid item xs={12}>
                <UpdateChoiceSelection
                  updateOption={updateOption}
                  setUpdateOption={setUpdateOption}
                  noCreate
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    id="inventory-item"
                    options={inventoryItems?.data || []}
                    getOptionLabel={(option: any) => option?.name || ''}
                    renderInput={(params) => (
                      <TextField {...params} label="Inventory Item" />
                    )}
                    value={
                      inventoryItems?.data?.find(
                        (item: any) => item.name === newItem.name,
                      ) || null
                    }
                    onChange={(e, newValue: any) => {
                      setNewItem({
                        ...newItem,
                        name: newValue.name || '',
                        price: newValue?.unitPrice || 0,
                        inventoryItemId: newValue.id,
                      });
                    }}
                    onInputChange={(e, newInputValue) => {
                      setNewItem({ ...newItem, name: newInputValue });
                    }}
                    sx={{ width: 'auto' }}
                    freeSolo
                  />
                </FormControl>
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
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={addNewItem}
                >
                  + Add
                </Button>
              </Grid> */}
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
                          {/* <IconButton onClick={() => removeItem(item.name)}>
                            <RemoveCircleIcon sx={{ color: errorColor }} />
                          </IconButton> */}
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
                <LoadingButton
                  variant="contained"
                  onClick={updateItems}
                  loading={isSubmitting}
                >
                  Save
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
