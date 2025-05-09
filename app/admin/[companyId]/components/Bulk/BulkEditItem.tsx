import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Modal,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ModalProps } from '../Modals/type';
import { BoxModal } from '../Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { ICategory, IItem } from '@/app/utils/type';
import { getAdminApiUrl } from '@/app/utils/enum';
import { checkedBoxOutlinedIcon } from '../Autocomplete/VendorSearch';
import { checkBoxOutlinedIcon } from '../Autocomplete/VendorSearch';
import ErrorComponent from '../ErrorComponent';
import { ShowNotificationType } from '@/hooks/useNotification';
import UnitRadio from '../Radio/UnitRadio';
import { getUniqueUnitRatios } from '@/app/utils/array';
import { grey } from '@mui/material/colors';
import { useParams } from 'next/navigation';

interface BulkEditItemProps extends ModalProps {
  item: any;
  showNotification: ShowNotificationType;
  refresh: () => void;
}

export default function BulkEditItem({
  open,
  onClose,
  item,
  showNotification,
  refresh,
}: BulkEditItemProps) {
  const { companyId }: any = useParams();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const [updatedItem, setUpdatedItem] = useState<IItem>(item);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);

  const itemUnits = useMemo(() => {
    const inventoryItemUnits = item?.inventoryItem?.vendorItem?.flatMap(
      (item: any) => item.unit,
    );
    const sellingUnits = getUniqueUnitRatios(inventoryItemUnits);

    return sellingUnits;
  }, [item]);

  useEffect(() => {
    setUpdatedItem(item);
  }, [item]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${getAdminApiUrl(companyId, `/categories?inventoryItemId=${item.inventoryItemId}`)}`,
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

  const addToUpdatedField = (newField: string) => {
    if (updatedFields.length === 0) {
      setUpdatedFields([newField]);
      return;
    }

    const isFieldExist = updatedFields.some(
      (field: string) => field === newField,
    );
    if (isFieldExist) {
      const newUpdatedField = updatedFields.filter(
        (field) => field !== newField,
      );
      setUpdatedFields(newUpdatedField);
    } else {
      setUpdatedFields([...updatedFields, newField]);
    }
  };

  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      showNotification('error', 'Please select at least one category');
      return;
    }

    try {
      setIsLoading(true);
      const categoryIds = selectedCategories.map((category) => category.id);

      const response = await axios.post(
        `${getAdminApiUrl(companyId, '/items/bulk-update')}`,
        {
          updatedItem,
          updatedFields,
          categoryIds,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Item updated successfully');
      refresh();
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" sx={{ overflowY: 'scroll' }}>
        <ModalHead
          heading="Bulk Edit Item"
          buttonLabel="Save"
          onClick={handleSave}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Typography variant="body2" sx={{ mt: 1, color: grey[600] }}>
          Please select categories and fields to update.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={1} width="100%">
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
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search for a category" />
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
          </Box>

          <Divider sx={{ my: 2 }}>Item Details</Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box display="flex" gap={2} alignItems="center">
              <Checkbox
                checked={updatedFields.some((field) => field === 'name')}
                onChange={() => addToUpdatedField('name')}
              />
              <Typography>Name</Typography>
            </Box>
            <TextField
              fullWidth
              label="Name"
              value={updatedItem.name}
              onChange={(e) =>
                setUpdatedItem({ ...updatedItem, name: e.target.value })
              }
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box display="flex" gap={2} alignItems="center">
              <Checkbox
                checked={updatedFields.some((field) => field === 'price')}
                onChange={() => addToUpdatedField('price')}
              />
              <Typography>Price</Typography>
            </Box>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={updatedItem.price}
              onChange={(e) =>
                setUpdatedItem({ ...updatedItem, price: +e.target.value })
              }
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" gap={2} alignItems="center">
                <Checkbox
                  checked={updatedFields.some(
                    (field) => field === 'isShowDiscount',
                  )}
                  onChange={() => addToUpdatedField('isShowDiscount')}
                />
                <Typography>Discount</Typography>
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
            {updatedItem.isShowDiscount ? (
              <TextField
                fullWidth
                label="Previous Price - Price Will Be Crossed Out"
                type="number"
                value={updatedItem.prevPrice}
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
          </Box>

          {itemUnits?.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box display="flex" gap={2} alignItems="center">
                <Checkbox
                  checked={updatedFields.some(
                    (field) => field === 'inventoryUnitId',
                  )}
                  onChange={() => addToUpdatedField('inventoryUnitId')}
                />
                <Typography>Units</Typography>
              </Box>
              <UnitRadio
                units={itemUnits}
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
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
