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
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { TrashIcon } from 'lucide-react';
import DeleteModal from '../delete/DeleteModal';
import AddOption from '../add/AddOption';
import OptionsTable from '../../Tables/OptionsTable';
import { useParams } from 'next/navigation';

interface IProps {
  open: boolean;
  onClose: () => void;
  targetItem: IItem;
  showNotification: (type: AlertColor, message: string) => void;
  includedButton?: boolean;
}

export enum UPDATE_OPTION {
  CURRENT_CATEGORY = 'current category',
  ALL_ITEMS_SAME_NAME = 'all items same name',
}

const EditItem = ({ open, onClose, targetItem, showNotification }: IProps) => {
  const { companyId }: any = useParams();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isOpenAddOption, setIsOpenAddOption] = useState<boolean>(false);
  const [updatedField, setUpdatedField] = useState<string[]>([]);
  const [updatedItem, setUpdatedItem] = useState<IItem>(targetItem);
  const [updateOption, setUpdateOption] = useState<UPDATE_OPTION>(
    UPDATE_OPTION.CURRENT_CATEGORY,
  );

  useEffect(() => {
    if (Object.keys(targetItem).length > 0) {
      const inventoryItemUnits = targetItem?.inventoryItem?.vendorItem.flatMap(
        (item: any) => item.unit,
      );
      const sellingUnits = getUniqueUnitRatios(inventoryItemUnits);

      setUpdatedItem({ ...targetItem, units: sellingUnits });
    }
  }, [targetItem]);

  const handleDeleteItem = async (targetItem: IItem) => {
    try {
      const response = await axios.delete(getAdminApiUrl(companyId, '/items'), {
        data: { removedId: targetItem.id },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

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
    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/items'), {
        updatedItem: newUpdatedItem,
        updateOption,
        updatedFields: updatedField,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
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
      {isOpenAddOption && (
        <AddOption
          open={isOpenAddOption}
          onClose={() => setIsOpenAddOption(false)}
          item={targetItem}
          showNotification={showNotification}
        />
      )}
      <DeleteModal
        open={isOpenDeleteModal}
        handleCloseModal={() => setIsOpenDeleteModal(false)}
        handleDelete={() => handleDeleteItem(targetItem)}
        targetObj={targetItem}
        showTargetObj={targetItem.name}
      />
      {/* { <Button onClick={() => setIsOpen(true)}>Edit</Button>} */}
      <Modal open={open} onClose={onClose}>
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
            onClose={onClose}
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
            {updatedItem?.options?.length === 0 ? (
              <>
                <Grid item textAlign="right" xs={12}>
                  <Button onClick={() => setIsOpenAddOption(true)}>
                    + Add Options
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    {updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME && (
                      <>
                        <Checkbox
                          value={updatedField.some(
                            (field) => field === 'price',
                          )}
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
              </>
            ) : (
              <Grid item xs={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6">Options:</Typography>
                  <Button onClick={() => setIsOpenAddOption(true)}>
                    + Add Options
                  </Button>
                </Box>
                <OptionsTable
                  options={updatedItem?.options || []}
                  showNotification={showNotification}
                />
              </Grid>
            )}
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
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                fullWidth
                color="error"
                onClick={() => setIsOpenDeleteModal(true)}
                variant="outlined"
              >
                <Box display="flex" gap={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Delete Item
                  </Typography>
                  <TrashIcon />
                </Box>
              </Button>
            </Grid>
          </Grid>
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(EditItem, (prev, next) => {
  return prev.targetItem === next.targetItem && prev.open === next.open;
});
