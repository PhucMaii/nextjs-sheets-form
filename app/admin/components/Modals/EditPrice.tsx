import { Notification, OrderedItems } from '@/app/utils/type';
import {
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import React, { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { BoxModal } from './styled';
import { ModalProps } from './type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { UpdateOption } from '@/pages/api/admin/orderedItems/PUT';
import { Order } from '../../orders/page';
import { infoColor } from '@/app/theme/color';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';

interface PropTypes extends ModalProps {
  items: OrderedItems[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  order: Order;
  handleUpdatePriceUI: (
    targetOrder: Order,
    newItems: any[],
    newTotalPrice: number,
  ) => void;
}

export default function EditPrice({
  open,
  onClose,
  items,
  setNotification,
  order,
  handleUpdatePriceUI,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemList, setItemList] = useState<OrderedItems[]>([...items]);
  const [updateOption, setUpdateOption] = useState<UpdateOption>(
    UpdateOption.NONE,
  );
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const calculateNewTotalPrice = () => {
    const totalPrice = itemList.reduce((acc: number, cV: any) => {
      return acc + cV.totalPrice;
    }, 0);
    return totalPrice;
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

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Edit Price</Typography>
          <LoadingButtonStyles
            variant="contained"
            loadingIndicator="Saving..."
            loading={isLoading}
            onClick={handleUpdatePrice}
            color={infoColor}
          >
            Save
          </LoadingButtonStyles>
        </Box>
        <RadioGroup
          row
          value={updateOption}
          onChange={(e) => setUpdateOption(e.target.value as UpdateOption)}
        >
          <FormControlLabel
            value={UpdateOption.NONE}
            control={<Radio />}
            label="Only for this time"
          />
          <FormControlLabel
            value={UpdateOption.CREATE}
            control={<Radio />}
            label="Create new category"
          />
          <FormControlLabel
            value={UpdateOption.UPDATE}
            control={<Radio />}
            label="Update the category"
          />
        </RadioGroup>
        <Divider />
        <Box overflow="auto" maxHeight="70vh" mt={2}>
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
                      {item.name} (Unit Price $)
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Unit Price ($)"
                        value={item.price}
                        onChange={(e) => handleItemOnChange(e, item)}
                        type="number"
                        inputProps={{ min: 0 }}
                      />
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
