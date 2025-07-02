import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { ModalProps } from '../Modals/type';
import ModalHead from '@/app/lib/ModalHead';
import { BoxModal } from '../Modals/styled';
import { ICategory, IItem } from '@/app/utils/type';
import {
  checkBoxOutlinedIcon,
  checkedBoxOutlinedIcon,
} from '../Autocomplete/VendorSearch';
import { getAdminApiUrl } from '@/app/utils/enum';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import OptionsTable from '../Tables/OptionsTable';
import ErrorComponent from '../ErrorComponent';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface IProps extends ModalProps {
  item: IItem;
  showNotification: ShowNotificationType;
  refetch?: any;
}

export default function BulkEditOptions({
  open,
  onClose,
  item,
  showNotification,
  refetch,
}: IProps) {
  const { companyId }: any = useParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const [options, setOptions] = useState<any[] | null>(null);

  // const [updatedItem] = SWRFetchData(
  //   getAdminApiUrl(companyId, `/items?itemId=${item.id}`),
  // );
  const { data: updatedItem, refetch: refetchUpdateItem } = useQuery({
    queryKey: ['item', item.id],
    queryFn: async () => {
      const res = await axios.get(
        getAdminApiUrl(companyId, `/items?itemId=${item.id}`),
      );

      return res.data;
    },
    enabled: !!item.id,
  });

  //   const [categories] = SWRFetchData(
  //     `${API_URL.CATEGORIES}?inventoryItemId=${item.inventoryItemId}`,
  //   );

  useEffect(() => {
    if (item) {
      fetchCategories();
    }
  }, [item]);

  useEffect(() => {
    if (updatedItem) {
      setOptions(updatedItem?.data?.options || []);
    }
  }, [updatedItem]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/categories?inventoryItemId=${item.inventoryItemId}`,
        ),
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
      const categoryIds = selectedCategories.map((category) => category.id);
      const response = await axios.put(
        getAdminApiUrl(companyId, '/bulk/options'),
        {
          inventoryItemId: item.inventoryItemId,
          categoryIds,
          updatedOptions: options,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic update
      // setItems?.((prevItems: any) => {
      //   const updatedItems = prevItems.map((item: any) => {
      //     // Check if exists in resItems - means updated
      //     const existingItem = resItems.find(
      //       (resItem: any) => resItem.id === item.id,
      //     );

      //     if (existingItem) {
      //       return existingItem;
      //     } else {
      //       return item;
      //     }
      //   });

      //   return updatedItems;
      // });

      refetch();
      refetchUpdateItem();

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const onAddOption = () => {
    if (!options) {
      return;
    }
    setOptions((prevOptions) => {
      if (!prevOptions) return [];
      return [
        ...prevOptions,
        {
          id: crypto.randomUUID(),
          name: '',
          price: 0,
          prevPrice: 0,
          isShowDiscount: false,
        },
      ];
    });
  };

  const onChangeOptions = useCallback(
    (id: any, field: string, value: any) => {
      if (!options) return;
      const newOptions = options.map((option: any) => {
        if (option.id === id) {
          return {
            ...option,
            [field]: value,
          };
        }

        return option;
      });

      setOptions([...newOptions]);
    },
    [options],
  );

  const onRemoveOption = useCallback(
    (optionId: number | string) => {
      if (!options) return [];
      const newOptions = options.filter((option) => option.id !== optionId);

      setOptions(newOptions);
    },
    [options],
  );

  const onSelectAllCategories = useCallback(
    (e: any) => {
      if (e.target.checked) {
        setSelectedCategories(categories);
      } else {
        setSelectedCategories([categories[0]]);
      }
    },
    [categories],
  );

  return (
    <>
      {/* <AddOption
        item={item}
        showNotification={showNotification}
        open={isOpenAddOption}
        onClose={() => setIsOpenAddOption(false)}
        noIncludeBulkAdd
      /> */}
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="90vh" overflow="auto">
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.length === categories.length}
                    onChange={onSelectAllCategories}
                  />
                }
                label="Select All"
              />
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

            {/* <Box display="flex" justifyContent="flex-end">
              <Button onClick={onAddOption}>
                + Add Options
              </Button>
            </Box> */}
            {options && options.length > 0 ? (
              <OptionsTable
                options={options}
                showNotification={showNotification}
                noIncludeOption
                // setItems={setItems}
                onChangeOptions={onChangeOptions}
                inventoryItemId={item.inventoryItemId || null}
                onRemoveOption={onRemoveOption}
              />
            ) : (
              <ErrorComponent errorText="No options found" />
            )}
          </Box>
          <Button
            onClick={onAddOption}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          >
            + Add Options
          </Button>
        </BoxModal>
      </Modal>
    </>
  );
}
