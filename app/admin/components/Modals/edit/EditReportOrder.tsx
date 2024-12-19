import {
  AlertColor,
  Box,
  // Button,
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
import React, { Fragment, memo, useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Item, Order } from '../../../orders/page';
import {
  disableChristmasAndNewYear,
  formatDateChanged,
} from '@/app/utils/time';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import { UpdateOption } from '@/pages/api/admin/orderedItems/PUT';
import { LoadingButton } from '@mui/lab';
import AddVendor from '../add/AddVendor';
import { ModalProps } from '../type';

interface PropTypes extends ModalProps {
  order: Order;
  handleUpdateOrderUI: (updatedOrder: Order) => void;
  showNotification: (type: AlertColor, message: string) => void;
}

const EditReportOrder = ({
  order,
  handleUpdateOrderUI,
  showNotification,
  open,
  onClose,
}: PropTypes) => {
  console.log('EDIT REPORT ORDER: ', order);
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenAddVendor, setIsOpenAddVendor] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [itemList, setItemList] = useState<Item[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  // const [newItem, setNewItem] = useState<any>({
  //   id: -1,
  //   price: 0,
  //   quantity: 0,
  //   totalPrice: 0,
  //   inventoryItemId: -1,
  // });
  const [updatedDate, setUpdatedDate] = useState<string>(order.deliveryDate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateOption, _setUpdateOption] = useState<UpdateOption>(
    UpdateOption.NONE,
  );
  // const [selectedVendorId, setSelectedVendorId] = useState<number>(-1);
  const [status, setStatus] = useState<ORDER_STATUS>(order.status);
  // const [vendorItems, setVendorItems] = useState<any[]>([]);

  // const [vendors] = SWRFetchData(`${API_URL.ADMIN}/vendors`);
  // const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  // const sortedVendors = useMemo(() => {
  //   if (!vendors?.data) {
  //     return [];
  //   }

  //   const vendorsSorted = [...vendors.data].sort((a: any, b: any) => {
  //     return a?.name?.localeCompare(b?.name);
  //   });

  //   return vendorsSorted;
  // }, [vendors]);

  useEffect(() => {
    if (order.items) {
      setItemList(order.items);
    }
  }, [order.items]);

  // useEffect(() => {
  //   if (selectedVendorId !== -1) {
  //     if (vendors) {
  //       const targetVendor = vendors?.data.find((vendor: any) => {
  //         return vendor.id === selectedVendorId;
  //       });

  //       if (targetVendor) {
  //         setVendorItems(targetVendor?.inventoryItems);
  //       }
  //     }
  //   } else {
  //     setVendorItems([]);
  //   }
  // }, [selectedVendorId, vendors]);

  // const addNewItem = () => {
  //   const newItemName = newItem.name.toUpperCase();
  //   const hasNameExisted = itemList.some(
  //     (item: OrderedItems) => item.name === newItemName,
  //   );

  //   if (newItem.name.trim() === '') {
  //     showNotification('error', 'Item Name Is Missing');
  //     return;
  //   }

  //   if (!newItem?.id || newItem.id === -1) {
  //     showNotification('error', 'Inventory Item Is Required');
  //     return;
  //   }
  //   if (hasNameExisted) {
  //     showNotification('error', 'Item Name Existed Already');
  //   } else {
  //     const totalPrice = newItem.quantity * newItem.price;
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { id, ...restOfNewItem } = newItem;
  //     const newItemData: any = {
  //       ...restOfNewItem,
  //       totalPrice,
  //       name: newItemName,
  //       inventoryItemId: id,
  //     };
  //     setItemList([...itemList, newItemData]);
  //     setNewItem({
  //       id: -1,
  //       name: '',
  //       price: 0,
  //       quantity: 0,
  //       totalPrice: 0,
  //       inventoryItemId: -1,
  //     });
  //   }
  // };

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

  // const handleNewItemOnChange = (key: string, value: any) => {
  //   setNewItem({ ...newItem, [key]: value });
  // };

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
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsSubmitting(false);
      showNotification('error', 'Fail to update item: ' + error);
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
          showNotification(
            'error',
            'Fail to update date and status: ' + orderUpdateResponse.data.error,
          );
          setIsSubmitting(false);
          return;
        }
      } else {
        showNotification('warning', 'None of fields has updated yet');
      }

      handleUpdateOrderUI({
        ...order,
        deliveryDate: updatedDate,
        status,
      });
      showNotification('success', 'Update Order Successfully');
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update order: ', error);
      setIsSubmitting(false);
      showNotification('error', 'Fail to update order: ' + error);
    }
  };

  // const removeItem = (itemName: string) => {
  //   const newItemList = itemList.filter((item: OrderedItems) => {
  //     return item.name !== itemName;
  //   });

  //   setItemList(newItemList);
  // };

  // const selectInventoryItem = (newValue: any) => {
  //   if (newValue?.inputValue) {
  //     setNewItem({
  //       ...newItem,
  //       id: 0,
  //       price: 0,
  //       unit: 'bags',
  //       name: newValue.inputValue,
  //       // vendorId: selectedVendorId,
  //       inventoryItemId: -1,
  //     });
  //   } else {
  //     setNewItem({
  //       ...newItem,
  //       id: newValue?.id || 0,
  //       price: newValue?.unitPrice || 0,
  //       name: newValue?.name,
  //       // vendorId: selectedVendorId,
  //       unit: newItem?.unit || 'bags',
  //       inventoryItemId: newItem?.inventoryItemId || -1,
  //     });
  //   }
  // };

  return (
    <>
      <AddVendor
        showNotification={showNotification}
        open={isOpenAddVendor}
        onClose={() => setIsOpenAddVendor(false)}
      />
      {/* <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        Edit
      </Button> */}
      <Modal open={open} onClose={onClose}>
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
                      shouldDisableDate={disableChristmasAndNewYear}
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
                <LoadingButton
                  variant="contained"
                  disabled={itemList.length === 0}
                  loading={isSubmitting}
                  onClick={handleUpdateOrder}
                >
                  SAVE
                </LoadingButton>
              </Grid>
            </Grid>
            {/* <Divider textAlign="center" sx={{ my: 3 }}>
              Add items
            </Divider> */}
            <Grid container spacing={3} mb={2}>
              {/* <Grid item xs={12}>
                <UpdateChoiceSelection
                  updateOption={updateOption}
                  setUpdateOption={setUpdateOption}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  value={newItem.name}
                  onChange={(event, newValue) => {
                    selectInventoryItem(newValue);
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    // const { inputValue } = params;
                    // // Suggest the creation of a new value
                    // const isExisting = options.some(
                    //   (option) => inputValue === option.name,
                    // );
                    // if (inputValue !== '' && !isExisting) {
                    //   filtered.push({
                    //     inputValue,
                    //     title: `Add "${inputValue}"`,
                    //   });
                    // }

                    return filtered;
                  }}
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  id="autocomplete"
                  options={
                    [
                      { id: -1, name: '-- Choose an item --' },
                      ...(inventoryItems?.data || []),
                    ] || []
                  }
                  getOptionLabel={(option) => {
                    // Check if the option has a custom title (for new item suggestion)
                    if (option.title) {
                      return option.title;
                    }
                    // Regular option
                    return option.name || '';
                  }}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        {option.title || option.name}
                      </li>
                    );
                  }}
                  sx={{ width: '100%' }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField {...params} label="Item" />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="item-name-label">Name</InputLabel>
                  <OutlinedInput
                    fullWidth
                    label="Name"
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
                <Button fullWidth variant="contained" onClick={addNewItem}>
                  + Add
                </Button>
              </Grid> */}
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
                  onClick={handleUpdateItems}
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
};

export default memo(EditReportOrder, (prev, next) => {
  return (
    prev.order === next.order,
    prev.showNotification === next.showNotification,
    prev.handleUpdateOrderUI === next.handleUpdateOrderUI,
    prev.open === next.open
  );
});
