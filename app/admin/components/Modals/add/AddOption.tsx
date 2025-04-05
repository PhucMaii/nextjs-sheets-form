import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControl,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import { ICategory, IItem, IOption } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import {
  checkBoxOutlinedIcon,
  checkedBoxOutlinedIcon,
} from '../../Autocomplete/VendorSearch';
import AddOptionWarning from '../AddOptionWarning';
import UnitRadio from '../../Radio/UnitRadio';
import { getUniqueUnitRatios } from '@/app/utils/array';

interface IProps extends ModalProps {
  item: IItem;
  showNotification: ShowNotificationType;
}

export default function AddOption({
  open,
  onClose,
  item,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkWarning, setCheckWarning] = useState<any>({
    open: false,
    acknowledged: false,
  });
  const [option, setOption] = useState<IOption | any>({
    id: -1,
    name: '',
    price: 0,
    availability: true,
    itemId: item.id,
    unitId: -1,
    item: item,
    unit: item?.inventoryUnit || null,
    inventoryItemId: item.inventoryItemId,
  });
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([
    item?.category as any,
  ]);
  const [unitList, setUnitList] = useState<any[]>([]);

  // const [unitList] = SWRFetchData(
  //   item?.inventoryUnit?.vendorItemId
  //     ? `${API_URL.ADMIN}/units?vendorItemId=${item?.inventoryUnit?.vendorItemId}`
  //     : '',
  // );
  const [categories] = SWRFetchData(
    `${API_URL.CATEGORIES}?inventoryItemId=${item.inventoryItemId}`,
  );

  useEffect(() => {
    if (item && Object.keys(item).length > 0) {
      const inventoryItemUnits = item.inventoryItem.vendorItem.flatMap(
        (item: any) => item.unit,
      );
      const sellingUnits = getUniqueUnitRatios(inventoryItemUnits);

      setUnitList(sellingUnits);
    }
  }, [item]);

  console.log(unitList, 'unitList');

  useEffect(() => {
    if (unitList) {
      setOption((prevOption: any) => ({
        ...prevOption,
        unit: unitList[0],
        unitId: unitList[0]?.id || -1,
      }));
    }
  }, [unitList]);
  // const { selectedUnit, UnitDisplay } =
  //   useEditUnit(unitList, null, showNotification, false);

  //   useEffect(() => {
  //     setOption((prevOption: any) => ({
  //       ...prevOption,
  //       unit: selectedUnit,
  //       unitId: selectedUnit?.id || -1,
  //     }));
  //   }, [selectedUnit]);

  // useEffect(() => {
  //   if (unitList) {
  //     setUnitList(unitList?.data);
  //   }
  // }, [unitList]);

  const handleAddOption = async () => {
    if (!option.name) {
      showNotification('error', 'Please fill out all the blank');
      return;
    }

    if (item?.options?.length === 0 && !checkWarning.acknowledged) {
      setCheckWarning({ open: true, acknowledged: true });
      return;
    }
    setIsLoading(true);
    try {
      // console.log(option);
      // return;
      const response = await axios.post(`${API_URL.ADMIN}/options`, {
        name: option.name,
        price: option.price,
        availability: option.availability,
        itemId: item.id,
        unitId: option.unitId || -1,
        inventoryItemId: item.inventoryItemId, // for finding items in selected category
        selectedCategoryIds: selectedCategories.map(
          (category: ICategory) => category.id,
        ),
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        error?.response?.data?.error || 'There was an error: ' + error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* {AddUnitModal} */}
      {/* {EditUnitModal}  */}
      {checkWarning.open && (
        <AddOptionWarning
          open={checkWarning.open}
          onClose={() => setCheckWarning({ ...checkWarning, open: false })}
          item={item}
          onAcknowledge={handleAddOption}
          selectedCategoryIds={selectedCategories.map(
            (category: ICategory) => category.id,
          )}
        />
      )}
      <Modal open={open} onClose={onClose}>
        <BoxModal>
          <ModalHead
            heading="Add Option"
            buttonLabel="ADD"
            onClose={onClose}
            onClick={handleAddOption}
            buttonProps={{ loading: isLoading }}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth>
              <Typography>Add to other client categories</Typography>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={categories?.data || []}
                getOptionLabel={(option: ICategory) => option?.name}
                isOptionEqualToValue={(option: ICategory, value: ICategory) =>
                  option.id === value.id
                }
                value={selectedCategories}
                onChange={(e, newValue: ICategory[]) => {
                  setSelectedCategories(newValue);
                  //   setOption({
                  //     ...option,
                  //     categories: selectedCategories,
                  //   });
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Enter categories..." />
                )}
                renderOption={(props, option, { selected }) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li
                      key={key}
                      {...optionProps}
                      aria-disabled={option.id === item.categoryId}
                    >
                      <Checkbox
                        icon={checkBoxOutlinedIcon}
                        checkedIcon={checkedBoxOutlinedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                        disabled={option.id === item.categoryId}
                      />
                      {option.name}
                    </li>
                  );
                }}
              />
            </FormControl>

            <FormControl fullWidth>
              <Typography>Name</Typography>
              <TextField
                placeholder="Enter option name..."
                value={option.name}
                onChange={(e) => {
                  setOption({
                    ...option,
                    name: e.target.value,
                  });
                }}
              />
            </FormControl>

            <FormControl fullWidth>
              <Typography>Price</Typography>
              <TextField
                placeholder="Enter option price..."
                type="number"
                value={option.price}
                onChange={(e) => {
                  setOption({
                    ...option,
                    price: Number(e.target.value),
                  });
                }}
              />
            </FormControl>

            {unitList?.length > 0 && (
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <UnitRadio
                    units={unitList || []}
                    value={option.unitId}
                    onChange={(e: any) =>
                      setOption((prevState: any) => ({
                        ...prevState,
                        unitId: e.target.value
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
