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
import { SWRFetchData } from '@/app/utils/db';
import useDebounce from '@/hooks/useDebounce';

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
  const [baseItems, setBaseItems] = useState<OrderedItems[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [newRouteId, setNewRouteId] = useState<number>(routeId);
  const [itemList, setItemList] = useState<OrderedItems[]>(() => {
    const formattedItems = order.items.map((item: OrderedItems) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });
    return formattedItems;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updateOption] = useState<UpdateOption>(UpdateOption.NONE);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const [clientItems] = SWRFetchData(
    `${API_URL.ADMIN}/items?categoryId=${order?.user?.categoryId}`,
  );

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = clientItems?.data?.filter((item: OrderedItems) => {
        const isExisted = itemList.find(
          (orderItem: OrderedItems) => orderItem.name === item.name,
        );

        if (isExisted) {
          return false;
        }
        if (item.name.toLowerCase().includes(debouncedKeywords.toLowerCase())) {
          return true;
        }
        return false;
      });
      setBaseItems(newOrderList || []);
    } else {
      const newOrderList = clientItems?.data?.filter((item: OrderedItems) => {
        const isExisted = itemList.find(
          (orderItem: OrderedItems) => orderItem.name === item.name,
        );

        if (isExisted) {
          return false;
        }
        return true;
      });
      setBaseItems(newOrderList || []);
    }
  }, [debouncedKeywords, clientItems]);

  useEffect(() => {
    const formattedItems = order.items.map((item: OrderedItems) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });

    setItemList(formattedItems);
  }, [order]);

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

    if (keyChange === 'quantity' && +e.target.value < 1) {
      const newItemList = itemList.filter(
        (item: OrderedItems) => item.name !== targetItem.name,
      );

      setItemList(newItemList);
      return;
    }

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

  const onChangeNewItemQuantity = (e: any, item: any) => {
    const newQuantity = +e.target.value;

    if (newQuantity < 1) {
      const newItemList = itemList.filter(
        (orderItem: OrderedItems) => orderItem.name !== item.name,
      );

      setItemList(newItemList);
      return;
    }

    const isExistedInItemList = itemList.find(
      (orderItem: OrderedItems) => orderItem.name === item.name,
    );

    if (isExistedInItemList) {
      const newItemList = itemList.map((orderItem: OrderedItems) => {
        if (orderItem.name === item.name) {
          return { ...orderItem, quantity: newQuantity };
        }
        return orderItem;
      });
      setItemList(newItemList);
    } else {
      setItemList([...itemList, { ...item, id: -1, quantity: newQuantity }]);
    }
  };

  const onChangeNewItemPrice = (e: any, item: any) => {
    const newPrice = +e.target.value;

    const newBaseItems = baseItems.map((baseItem: any) => {
      if (baseItem.id === item.id) {
        return { ...baseItem, price: newPrice };
      }
      return baseItem;
    });

    setBaseItems(newBaseItems);
  };

  const switchRoute = async () => {
    if (newRouteId === routeId) {
      showNotification('warning', 'Route Has Not Been Changed');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.put(API_URL.SCHEDULED_ORDER, {
        user: order.user,
        scheduledOrderId: order.id,
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
              <Grid item xs={12}>
                <Divider>Category Items</Divider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Search items"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  type="text"
                  placeholder="Search items"
                />
              </Grid>
              {baseItems.length > 0 && debouncedKeywords !== '' && (
                <>
                  {/* <Grid item xs={12}>
                    <Typography variant="h6">New items</Typography>
                  </Grid> */}
                  {baseItems.map((item: OrderedItems, index) => {
                    return (
                      <Fragment key={index}>
                        <Grid item xs={12} fontWeight="bold">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h6" fontWeight="bold">
                              {item.name}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item container columnSpacing={2}>
                          <Grid item xs={6} textAlign="right">
                            <TextField
                              fullWidth
                              label="Unit Price ($)"
                              value={item.price}
                              onChange={(e) =>
                                // handleChangeItem(e, item, 'price')
                                onChangeNewItemPrice(e, item)
                              }
                              type="number"
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Quantity"
                              value={item.quantity}
                              onChange={(e) => onChangeNewItemQuantity(e, item)}
                              type="number"
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        </Grid>
                      </Fragment>
                    );
                  })}
                </>
              )}

              <Grid item xs={12}>
                <Divider>Current items</Divider>
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
