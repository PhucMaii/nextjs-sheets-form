import {
  Autocomplete,
  Box,
  Divider,
  FormControl,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import useEditUnit from '@/hooks/unit/useEditUnit';
import { ICategory, IItem, IOption } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';

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
  const [option, setOption] = useState<IOption | any>({
    id: -1,
    name: '',
    price: 0,
    availability: true,
    itemId: item.id,
    unitId: -1,
    item: item,
    unit: item?.inventoryUnit || null,
  });
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([item?.category as any]);

  const [dbUnits] = SWRFetchData(
    item?.inventoryUnit?.vendorItemId
      ? `${API_URL.ADMIN}/units?vendorItemId=${item?.inventoryUnit?.vendorItemId}`
      : '',
  );
  const [categories] = SWRFetchData(`${API_URL.CATEGORIES}?inventoryItemId=${item.inventoryItemId}`);

  const { selectedUnit, AddUnitModal, EditUnitModal, UnitDisplay } =
    useEditUnit(dbUnits?.data, null, showNotification, false);

  useEffect(() => {
    setOption((prevOption: any) => ({
      ...prevOption,
      unit: selectedUnit,
      unitId: selectedUnit?.id || -1,
    }));
  }, [selectedUnit]);

  const handleAddOption = async () => {
    setIsLoading(true);
    try {
      // console.log(option);
      // return;
      const response = await axios.post(`${API_URL.ADMIN}/options`, {
        option,
        selectedCategoryIds: selectedCategories.map(
          (category: ICategory) => category.id,
        ),
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
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
      {AddUnitModal}
      {EditUnitModal}
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
                options={categories?.data || []}
                getOptionLabel={(option: ICategory) => option.name}
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

            {UnitDisplay}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
