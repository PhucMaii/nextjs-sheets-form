import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Modal,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import ModalHead from '@/app/lib/ModalHead';
import { BoxModal } from '../styled';
import { IItem } from '@/app/utils/type';
import UnitRadio from '../../Radio/UnitRadio';
import { getUniqueUnitRatios } from '@/app/utils/array';
import ErrorComponent from '../../ErrorComponent';

interface IProps {
  targetItem: IItem;
  handleUpdateItem: (
    updatedItem: IItem,
    updateOption: UPDATE_OPTION,
    updatedFields: string[],
  ) => Promise<void>;
  showNotification: (type: AlertColor, message: string) => void;
}

export enum UPDATE_OPTION {
  CURRENT_CATEGORY = 'current category',
  ALL_ITEMS_SAME_NAME = 'all items same name',
}

const EditItem = ({ targetItem, handleUpdateItem, showNotification }: IProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatedField, setUpdatedField] = useState<string[]>([]);
  const [updatedItem, setUpdatedItem] = useState<IItem>(targetItem);
  const [updateOption, setUpdateOption] = useState<UPDATE_OPTION>(
    UPDATE_OPTION.CURRENT_CATEGORY,
  );

  useEffect(() => {
    if (Object.keys(targetItem).length > 0) {
      const inventoryItemUnits = targetItem.inventoryItem.vendorItem.flatMap(
        (item: any) => item.unit,
      );
      const sellingUnits = getUniqueUnitRatios(inventoryItemUnits);

      setUpdatedItem({ ...targetItem, units: sellingUnits });
    }
  }, [targetItem]);

  const updateItem = async () => {
    const newUpdatedItem = {
      ...updatedItem,
      name: updatedItem.name.toUpperCase(),
    };

    if (
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME &&
      updatedField.length === 0
    ) {
      showNotification('error', 'Please select at least one field to update');
      return;
    }

    setIsUpdating(true);
    await handleUpdateItem(newUpdatedItem, updateOption, updatedField);
    setIsUpdating(false);
  };

  const addToUpdatedField = (newField: string) => {
    if (updatedField.length === 0) {
      setUpdatedField([newField]);
      return;
    }

    const isFieldExist = updatedField.some(
      (field: string) => field === newField,
    );
    if (isFieldExist) {
      const newUpdatedField = updatedField.filter(
        (field) => field !== newField,
      );
      setUpdatedField(newUpdatedField);
    } else {
      setUpdatedField([...updatedField, newField]);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit</Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          overflow="auto"
          maxHeight="80vh"
        >
          <ModalHead
            heading="Edit Item"
            buttonLabel="EDIT"
            onClick={updateItem}
            buttonProps={{ loading: isUpdating }}
            onClose={() => setIsOpen(false)}
          />
          <RadioGroup
            row
            value={updateOption}
            onChange={(e) => setUpdateOption(e.target.value as UPDATE_OPTION)}
          >
            <FormControlLabel
              value={UPDATE_OPTION.CURRENT_CATEGORY}
              control={<Radio />}
              label="Only current category"
            />
            <FormControlLabel
              value={UPDATE_OPTION.ALL_ITEMS_SAME_NAME}
              control={<Radio />}
              label="Same inventory item"
            />
          </RadioGroup>
          <Divider sx={{ my: 2 }}>Price ($)</Divider>
          <Grid container rowGap={2} alignItems="center">
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                {updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME && (
                  <>
                    <Checkbox
                      value={updatedField.some((field) => field === 'price')}
                      onChange={() => addToUpdatedField('price')}
                    />
                  </>
                )}
                <Typography variant="h6">Price:</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={updatedItem.price}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, price: +e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME && (
                    <>
                      <Checkbox
                        value={updatedField.some(
                          (field) => field === 'isShowDiscount',
                        )}
                        onChange={() => addToUpdatedField('isShowDiscount')}
                      />
                    </>
                  )}
                  <Typography variant="h6">Discount</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={updatedItem.isShowDiscount}
                      onChange={(e) =>
                        setUpdatedItem({
                          ...updatedItem,
                          isShowDiscount: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Show Discount"
                  labelPlacement="start"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              {updatedItem?.isShowDiscount ? (
                <TextField
                  fullWidth
                  label="Previous Price - Price Will Be Crossed Out"
                  type="number"
                  value={updatedItem?.prevPrice || 0}
                  onChange={(e) =>
                    setUpdatedItem({
                      ...updatedItem,
                      prevPrice: +e.target.value,
                    })
                  }
                />
              ) : (
                <ErrorComponent errorText="No Discount Display" />
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }}>Other Details</Divider>
          <Grid container rowGap={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={2} alignItems="center">
                {updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME && (
                  <>
                    <Checkbox
                      value={updatedField.some((field) => field === 'name')}
                      onChange={() => addToUpdatedField('name')}
                    />
                  </>
                )}
                <Typography variant="h6">Name:</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                type="text"
                value={updatedItem.name}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, name: e.target.value })
                }
              />
            </Grid>
            {updatedItem?.units?.length > 0 && (
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" gap={2} alignItems="center">
                    {updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME && (
                      <>
                        <Checkbox
                          value={updatedField.some(
                            (field) => field === 'inventoryUnitId',
                          )}
                          onChange={() => addToUpdatedField('inventoryUnitId')}
                        />
                      </>
                    )}
                    <Typography variant="h6">Units:</Typography>
                  </Box>
                  <UnitRadio
                    units={updatedItem.units}
                    value={JSON.stringify(updatedItem.inventoryUnit)}
                    onChange={(e: any) =>
                      setUpdatedItem((prevState: any) => ({
                        ...prevState,
                        inventoryUnit: JSON.parse(e.target.value),
                        inventoryUnitId: JSON.parse(e.target.value).id,
                      }))
                    }
                    isShowPrice
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(EditItem, (prev, next) => {
  return prev.targetItem === next.targetItem;
});
