import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../Modals/type';
import ModalHead from '@/app/lib/ModalHead';
import { BoxModal } from '../Modals/styled';
import { ICategory, IItem } from '@/app/utils/type';
import {
  checkBoxOutlinedIcon,
  checkedBoxOutlinedIcon,
} from '../Autocomplete/VendorSearch';
import { API_URL } from '@/app/utils/enum';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import OptionsTable from '../Tables/OptionsTable';
import { SWRFetchData } from '@/app/utils/db';
import AddOption from '../Modals/add/AddOption';
import ErrorComponent from '../ErrorComponent';

interface IProps extends ModalProps {
  item: IItem;
  showNotification: ShowNotificationType;
  setItems: any;
}

export default function BulkEditOptions({
  open,
  onClose,
  item,
  showNotification,
  setItems,
}: IProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isOpenAddOption, setIsOpenAddOption] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);

  const [updatedItem] = SWRFetchData(`${API_URL.ITEM}?itemId=${item.id}`);

  //   const [categories] = SWRFetchData(
  //     `${API_URL.CATEGORIES}?inventoryItemId=${item.inventoryItemId}`,
  //   );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL.CATEGORIES}?inventoryItemId=${item.inventoryItemId}`,
      );

      if (response.data.data) {
        const itemCategory = response.data.data.find(
          (category: ICategory) => category.id === item.categoryId,
        );

        if (itemCategory) {
          setSelectedCategories([itemCategory]);
        }
        setCategories(response.data.data);
      }
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    }
  };

  const handleSave = async () => {
    if (!updatedItem?.data) return;

    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/bulk/options`, {
        inventoryItemId: item.inventoryItemId,
        categories: selectedCategories,
        updatedOptions: updatedItem?.data?.options,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      const resItems = response.data.data;

      // Optimistic update
      setItems((prevItems: any) => {
        const updatedItems = prevItems.map((item: any) => {
          // Check if exists in resItems - means updated
          const existingItem = resItems.find(
            (resItem: any) => resItem.id === item.id,
          );

          if (existingItem) {
            return existingItem;
          } else {
            return item;
          }
        });

        return updatedItems;
      });

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AddOption
        item={item}
        showNotification={showNotification}
        open={isOpenAddOption}
        onClose={() => setIsOpenAddOption(false)}
        noIncludeBulkAdd
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal>
          <ModalHead
            heading="Bulk Edit Options"
            buttonLabel="Save"
            onClose={onClose}
            onClick={handleSave}
            buttonProps={{
              loading: isLoading,
            }}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Assign Category</Typography>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={categories || []}
                getOptionLabel={(option: ICategory) => option?.name}
                isOptionEqualToValue={(option: ICategory, value: ICategory) =>
                  option.id === value.id
                }
                value={selectedCategories}
                onChange={(e, newValue: ICategory[]) => {
                  const isIncludeItemCategory = newValue.some(
                    (category) => category.id === item.categoryId,
                  );

                  if (isIncludeItemCategory) {
                    setSelectedCategories(newValue);
                  }
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

                  // const isItemCategory = option.id === item.categoryId;
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
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button onClick={() => setIsOpenAddOption(true)}>
                + Add Options
              </Button>
            </Box>
            {updatedItem?.data?.options &&
              updatedItem?.data?.options.length > 0 ? (
                <OptionsTable
                  options={updatedItem?.data?.options || []}
                  showNotification={showNotification}
                  noIncludeOption
                  setItems={setItems}
                />
              ): (
                <ErrorComponent errorText="No options found" />
              )}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
