import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Modal,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IOption } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { UPDATE_OPTION } from './EditItem';
import UnitRadio from '../../Radio/UnitRadio';
import { getUniqueUnitRatios } from '@/app/utils/array';

interface IProps extends ModalProps {
  option: IOption;
  showNotification: ShowNotificationType;
}

export default function EditOption({
  open,
  onClose,
  option,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [units, setUnits] = useState<IInventoryUnit[]>([]);
  const [updatedOption, setUpdatedOption] = useState<IOption>({
    ...option,
    isShowDiscount: option?.isShowDiscount || false,
    prevPrice: option?.prevPrice || 0,
  });
  const [updateChoice, setUpdateChoice] = useState<UPDATE_OPTION>(
    UPDATE_OPTION.CURRENT_CATEGORY,
  );
  const [unitList, setUnitList] = useState<any[]>([]);

  const [item] = SWRFetchData(
    option?.itemId ? `${API_URL.ADMIN}/items?itemId=${option?.itemId}` : '',
  );

  useEffect(() => {
    if (item && Object.keys(item?.data).length > 0) {
      const inventoryItemUnits = item?.data?.inventoryItem?.vendorItem.flatMap(
        (vItem: any) => vItem.unit,
      );
      const sellingUnits = getUniqueUnitRatios(inventoryItemUnits);

      setUnitList(sellingUnits);
    }
  }, [item]);

  // const { selectedUnit, UnitDisplay, AddUnitModal, EditUnitModal } =
  //   useEditUnit(units, updatedOption.unit, showNotification);

  // useEffect(() => {
  //   if (unitList) {
  //     setUnits(unitList?.data);
  //   }
  // }, [unitList]);

  // useEffect(() => {
  //   if (option) {
  //     setUpdatedOption({
  //       ...option,
  //       isShowDiscount: option?.isShowDiscount || false,
  //       prevPrice: option?.prevPrice || 0,
  //     });
  //   }
  // }, [option]);

  // useEffect(() => {
  //   if (unitList) {
  //     setUpdatedOption((prevOption: any) => ({
  //       ...prevOption,
  //       unit: unitList[0],
  //       unitId: unitList[0]?.id || -1,
  //     }));
  //   }
  // }, [unitList]);

  const handleUpdateOption = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/options`, {
        id: updatedOption.id,
        name: updatedOption.name,
        price: updatedOption.price,
        prevPrice: updatedOption?.prevPrice || 0,
        isShowDiscount: updatedOption?.isShowDiscount || false,
        unitId: Number(updatedOption?.unitId),
        isUpdateSameInventory:
          updateChoice === UPDATE_OPTION.ALL_ITEMS_SAME_NAME,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* {AddUnitModal}
      {EditUnitModal} */}
      <Modal open={open} onClose={onClose}>
        <BoxModal>
          <ModalHead
            heading="Edit Option"
            buttonLabel="EDIT"
            onClick={handleUpdateOption}
            buttonProps={{ loading: isLoading }}
            onClose={onClose}
          />

          <RadioGroup
            row
            value={updateChoice}
            onChange={(e) => setUpdateChoice(e.target.value as UPDATE_OPTION)}
            // onChange={(e) => setUpdateOption(e.target.value as UPDATE_OPTION)}
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

          <Divider sx={{ my: 2 }}>Price</Divider>

          <Box display="flex" flexDirection="column" gap={2}>
            {/* <FormControl fullWidth>
              <Typography>Price</Typography>
              <TextField
                placeholder="Enter option price..."
                type="number"
                value={updatedOption.price}
                onChange={(e) => {
                  setUpdatedOption({
                    ...option,
                    price: Number(e.target.value),
                  });
                }}
              />
            </FormControl> */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                {/* {updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME && (
                      <>
                        <Checkbox
                          value={updatedField.some(
                            (field) => field === 'price',
                          )}
                          onChange={() => addToUpdatedField('price')}
                        />
                      </>
                    )} */}
                <Typography>Price:</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={updatedOption.price}
                onChange={(e) =>
                  setUpdatedOption({ ...updatedOption, price: +e.target.value })
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
                  {/* {updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME && (
                        <>
                          <Checkbox
                            value={updatedField.some(
                              (field) => field === 'isShowDiscount',
                            )}
                            onChange={() => addToUpdatedField('isShowDiscount')}
                          />
                        </>
                      )} */}
                  <Typography>Discount</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={updatedOption?.isShowDiscount || false}
                      onChange={(e) =>
                        setUpdatedOption({
                          ...updatedOption,
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
              {updatedOption?.isShowDiscount && (
                <TextField
                  fullWidth
                  label="Previous Price - Price Will Be Crossed Out"
                  type="number"
                  value={updatedOption?.prevPrice || 0}
                  onChange={(e) =>
                    setUpdatedOption({
                      ...updatedOption,
                      prevPrice: +e.target.value,
                    })
                  }
                />
              )}
            </Grid>

            <Divider sx={{ my: 2 }}>Other Details</Divider>
            <FormControl fullWidth>
              <Typography>Name</Typography>
              <TextField
                placeholder="Enter option name..."
                value={updatedOption.name}
                onChange={(e) =>
                  setUpdatedOption({
                    ...updatedOption,
                    name: e.target.value,
                  })
                }
              />
            </FormControl>

            {unitList?.length > 0 && (
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <UnitRadio
                    units={unitList || []}
                    value={updatedOption.unitId}
                    onChange={(e: any) =>
                      setUpdatedOption((prevState: any) => ({
                        ...prevState,
                        // unit: JSON.parse(e.target.value),
                        unitId: +e.target.value,
                      }))
                    }
                    idValue
                  />
                </Box>
              </Grid>
            )}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
