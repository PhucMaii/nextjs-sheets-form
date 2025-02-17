import {
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Modal,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { OrderedItems } from '@/app/utils/type';
import { Item, Order } from '../../../orders/page';
import { ModalProps } from '../type';
import { LoadingButton } from '@mui/lab';
import useEditUnit from '@/hooks/unit/useEditUnit';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
// import { USER_ROLE } from '@/app/utils/enum';

interface PropTypes extends ModalProps {
  order: Order;
  item: OrderedItems;
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
    isConvertToCustom?: boolean,
  ) => Promise<void>;
  role: USER_ROLE;
}

export default function EditItemModal({
  open,
  onClose,
  order,
  item,
  handleUpdateItem,
  role,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConvertToCustom, setIsConvertToCustom] = useState<boolean>(false);
  const [updatedItem, setUpdatedItem] = useState<OrderedItems>({
    ...item,
  });
  const [unitList, setUnitList] = useState<any[]>([]);

  const { showNotification, NotificationComp } = useNotification();

  const [units] = SWRFetchData(
    `${API_URL.ADMIN}/units?vendorItemId=${item?.inventoryUnit?.vendorItemId}`,
  );

  console.log(item, 'item');

  const {
    units: newUnits,
    selectedUnit,
    AddUnitModal,
    EditUnitModal,
    UnitDisplay,
  } = useEditUnit(unitList, updatedItem.inventoryUnit, showNotification);

  useEffect(() => {
    if (units) {
      setUnitList(units?.data);
    }
  }, [units]);

  useEffect(() => {
    if (item) {
      setUpdatedItem({ ...item });
      setIsConvertToCustom(false);
    }
  }, [item]);

  // useEffect(() => {
  //   if (newUnits) {
  //     setUpdatedItem((prevState: any) => ({...prevState, newUnits}));
  //   }
  // }, [newUnits]);

  // useEffect(() => {
  //   if (selectedUnit) {
  //     setUpdatedItem((prevState: any) => ({
  //       ...prevState,
  //       inventoryUnit: {
  //         ...selectedUnit,
  //         vendorItemId: item.inventoryUnit.vendorItemId,
  //       },
  //     }));
  //   }
  // }, [selectedUnit]);

  const handleUpdateData = async () => {
    setIsLoading(true);
    const newTotalPrice = calculateNewTotalPrice();
    await handleUpdateItem(
      newTotalPrice,
      order,
      {
        ...updatedItem,
        inventoryUnit: {
          ...selectedUnit,
          vendorItemId: item.inventoryUnit.vendorItemId,
        },
        units: newUnits,
      },
      isConvertToCustom,
    );
    setIsLoading(false);
    setIsConvertToCustom(false);
  };

  const calculateNewTotalPrice = () => {
    const totalPrice = order.items.reduce((acc: number, cV: Item) => {
      if (cV.id === item.id) {
        return acc + updatedItem.totalPrice;
      }
      return acc + cV.totalPrice;
    }, 0);
    return totalPrice;
  };

  return (
    <>
      {NotificationComp}
      {role === USER_ROLE.ADMIN && isConvertToCustom && AddUnitModal}
      {role === USER_ROLE.ADMIN && isConvertToCustom && EditUnitModal}
      <Modal open={open} onClose={onClose}>
        <BoxModal display="flex" flexDirection="column" gap={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">{updatedItem.name}</Typography>
            <LoadingButton
              variant="contained"
              loadingIndicator="Saving..."
              loading={isLoading}
              onClick={handleUpdateData}
            >
              Save
            </LoadingButton>
          </Box>
          <Divider />
          {role === USER_ROLE.ADMIN && !item?.isCustomAmount && (
            <Box display="flex" justifyContent="flex-end" width="100%">
              <FormControlLabel
                control={
                  <Switch
                    checked={isConvertToCustom}
                    onChange={(e: any) =>
                      setIsConvertToCustom(e.target.checked)
                    }
                  />
                }
                label="Convert to custom"
              />
            </Box>
          )}
          <Grid container alignItems="center" rowGap={4} mt={2}>
            {isConvertToCustom && (
              <>
                <Grid item xs={6}>
                  <Typography>Name</Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={updatedItem.name}
                    onChange={(e: any) =>
                      setUpdatedItem((prevOrder: OrderedItems) => ({
                        ...prevOrder,
                        name: e.target.value,
                      }))
                    }
                  />
                </Grid>
              </>
            )}
            <Grid item xs={6}>
              <Typography variant="h6">Quantity</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Quantity"
                value={updatedItem.quantity}
                type="number"
                onChange={(e: any) =>
                  setUpdatedItem((prevOrder: OrderedItems) => ({
                    ...prevOrder,
                    quantity: +e.target.value,
                    totalPrice: prevOrder.price * +e.target.value,
                  }))
                }
                fullWidth
              />
            </Grid>
            {role === USER_ROLE.ADMIN && isConvertToCustom && (
              <Grid item xs={12}>
                {UnitDisplay}
              </Grid>
            )}
            <Grid item xs={6}>
              <Typography variant="h6">Unit Price</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Unit Price"
                value={updatedItem.price}
                onChange={(e: any) =>
                  setUpdatedItem((prevOrder: OrderedItems) => ({
                    ...prevOrder,
                    price: +e.target.value,
                    totalPrice: prevOrder.quantity * +e.target.value,
                  }))
                }
                fullWidth
                type="number"
              />
            </Grid>
          </Grid>
          <Divider />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Total Price</Typography>
            <Typography variant="h6">
              {updatedItem?.totalPrice?.toFixed(2) ||
                item.totalPrice.toFixed(2)}
            </Typography>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
