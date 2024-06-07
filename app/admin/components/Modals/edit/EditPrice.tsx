import { Notification, OrderedItems } from '@/app/utils/type';
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
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { UpdateOption } from '@/pages/api/admin/orderedItems/PUT';
import { Order } from '../../../orders/page';
import { errorColor } from '@/app/theme/color';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import UpdateChoiceSelection from '../../UpdateChoiceSelection';
import { SubCategory } from '@prisma/client';
import { LoadingButton } from '@mui/lab';

interface PropTypes extends ModalProps {
  items: OrderedItems[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  order: Order;
  handleUpdatePriceUI: (
    targetOrder: Order,
    newItems: any[],
    newTotalPrice: number,
  ) => void;
  subcategories: SubCategory[];
}

export default function EditPrice({
  open,
  onClose,
  items,
  setNotification,
  order,
  handleUpdatePriceUI,
  subcategories,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemList, setItemList] = useState<OrderedItems[]>([]);
  const [updateOption, setUpdateOption] = useState<UpdateOption>(
    UpdateOption.NONE,
  );
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newItem, setNewItem] = useState<OrderedItems>({
    name: '',
    price: 0,
    quantity: 0,
    totalPrice: 0,
  });
  const [subcategoryId, setSubcategoryId] = useState<number>(0);

  useEffect(() => {
    if (items) {
      setItemList(items);
    }
  }, [items]);

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
      const newItemData: any = { ...newItem, totalPrice, name: newItemName };
      if (subcategoryId > 0) {
        newItemData.subCategoryId = subcategoryId;
      }
      setItemList([...itemList, newItemData]);
      setNewItem({
        name: '',
        price: 0,
        quantity: 0,
        totalPrice: 0,
      });
    }

    setSubcategoryId(0);
  };

  const calculateNewTotalPrice = () => {
    const totalPrice = itemList.reduce((acc: number, cV: any) => {
      return acc + cV.totalPrice;
    }, 0);

    return totalPrice;
  };

  const handleNewItemOnChange = (key: string, value: any) => {
    setNewItem({ ...newItem, [key]: value });
  };

  const handleUpdatePrice = async () => {
    try {
      setIsLoading(true);
      const totalPrice = calculateNewTotalPrice();
      const response = await axios.put(API_URL.ORDERED_ITEMS, {
        updatedItems: [...itemList],
        orderTotalPrice: totalPrice,
        orderId: order.id,
        updateOption,
        categoryName: newCategoryName,
        userId: order.userId,
        userCategoryId: order.category.id,
        userSubCategoryId: order.subCategoryId,
      });

      if (response.data.error) {
        setIsLoading(false);
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleUpdatePriceUI(order, itemList, totalPrice);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update price: ' + error.response.data.error,
      });
      setIsLoading(false);
    }
  };

  const handleItemOnChange = (e: any, targetItem: OrderedItems) => {
    const newItemList = itemList.map((item: OrderedItems) => {
      if (item.id === targetItem.id) {
        const newPrice = Number(e.target.value);
        const newTotal = newPrice * item.quantity;
        return { ...item, price: newPrice, totalPrice: newTotal };
      }
      return item;
    });
    setItemList(newItemList);
  };

  const removeItem = (itemName: string) => {
    const newItemList = itemList.filter((item: OrderedItems) => {
      return item.name !== itemName;
    });

    setItemList(newItemList);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Edit Price</Typography>
          <LoadingButton
            variant="contained"
            loadingIndicator="Saving..."
            loading={isLoading}
            onClick={handleUpdatePrice}
          >
            Save
          </LoadingButton>
        </Box>
        <UpdateChoiceSelection
          updateOption={updateOption}
          setUpdateOption={setUpdateOption}
        />
        <Box overflow="auto" maxHeight="70vh" mt={1}>
          <Divider sx={{ mb: 2 }}>Add items</Divider>
          <Grid container spacing={3} mb={1}>
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
              <FormControl fullWidth>
                <InputLabel id="subcategory-label">Subcategory</InputLabel>
                <Select
                  disabled={
                    !newItem.name.toLowerCase().includes('bean') &&
                    !newItem.name.toLowerCase().includes('egg')
                  }
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(+e.target.value)}
                >
                  <MenuItem value={0}>-- Choose a subcategory --</MenuItem>
                  {subcategories.length > 0 &&
                    subcategories.map((subcategory: SubCategory) => {
                      return (
                        <MenuItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth onClick={addNewItem} variant="contained">
                Add
              </Button>
            </Grid>
          </Grid>
          <Divider>Items</Divider>
          <Grid
            container
            alignItems="center"
            columnSpacing={2}
            rowGap={4}
            mt={2}
          >
            {updateOption === UpdateOption.CREATE && (
              <>
                <Grid item xs={6}>
                  New Category Name
                </Grid>
                <Grid item xs={6}>
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
              itemList.map((item: any, index: number) => {
                return (
                  <Fragment key={index}>
                    <Grid item xs={6}>
                      {item.name}:
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Unit Price ($)"
                        value={item.price}
                        onChange={(e) => handleItemOnChange(e, item)}
                        type="number"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton onClick={() => removeItem(item.name)}>
                        <RemoveCircleIcon sx={{ color: errorColor }} />
                      </IconButton>
                    </Grid>
                  </Fragment>
                );
              })}
          </Grid>
        </Box>
      </BoxModal>
    </Modal>
  );
}
