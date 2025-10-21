import {
  AlertColor,
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
// import { IItem } from '@/app/utils/type';
import { getAdminApiUrl } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import {
  checkBoxOutlinedIcon,
  checkedBoxOutlinedIcon,
} from '../../Autocomplete/VendorSearch';
import UnitRadio from '../../Radio/UnitRadio';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  categoryId?: number;
  addItem?: any;
  showNotification: (type: AlertColor, message: string) => void;
  defaultItem?: any;
  onAddTempItem?: any;
}

export default function AddItem({
  open,
  onClose,
  categoryId,
  addItem,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showNotification,
  defaultItem,
  onAddTempItem,
}: IProps) {
  const { companyId }: any = useParams();
  const [disabledCategories, setDisabledCategories] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<any>({
    id: -1,
    name: '',
    units: [],
    unit: null,
    price: 0,
    categoryId,
    inventoryItemId: -1,
    availability: true,
  });
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);

  // const { units, selectedUnit, AddUnitModal, EditUnitModal, UnitDisplay } =
  //   useEditUnit(newItem.units, newItem.unit, showNotification, true);

  const [inventoryItems] = SWRFetchData(
    `${getAdminApiUrl(companyId, '/inventory')}`,
  );
  const [categories] = SWRFetchData(getAdminApiUrl(companyId, '/categories?all=true'));

  useEffect(() => {
    if (defaultItem && inventoryItems) {
      if (defaultItem.inventoryItemId > 0) {
        const newValue = inventoryItems.data.find(
          (item: any) => item.id === defaultItem.inventoryItemId,
        );

        let newUnits = newValue.vendorItem.flatMap((item: any) => item.unit);

        newUnits = Array.from(
          new Map(newUnits.map((unit: any) => [unit.ratio, unit])).values(),
        );

        setNewItem((prevItem: any) => {
          return {
            ...prevItem,
            ...defaultItem,
            units: newUnits,
            unit: newUnits[0],
            inventoryItemId: newValue.id,
            inventoryItem: newValue,
          };
        });
      }
    }
  }, [defaultItem, inventoryItems]);

  useEffect(() => {
    if (newItem.inventoryItemId > 0) {
      const targetInventoryItem = inventoryItems?.data?.find(
        (item: any) => item.id === newItem.inventoryItemId,
      );

      if (targetInventoryItem) {
        const categoriesRelated = targetInventoryItem.item
          .map((item: any) => item.category)
          .flat();

        setDisabledCategories(categoriesRelated);
      }
    }
  }, [newItem, categories]);

  useEffect(() => {
    if (categoryId) {
      setNewItem({ ...newItem, categoryId });

      const currentCategory = categories?.data?.find(
        (cat: any) => cat.id === categoryId,
      );
      setSelectedCategories(currentCategory ? [currentCategory] : []);
    }
  }, [categoryId]);

  // useEffect(() => {
  //   setNewItem((prevState: any) => ({ ...prevState, unit: selectedUnit }));
  // }, [selectedUnit]);

  // useEffect(() => {
  //   setNewItem((prevState: any) => ({ ...prevState, units }));
  // }, [units]);

  useEffect(() => {
    if (categories) {
      const currentCategory = categories.data.find(
        (cat: any) => cat.id === categoryId,
      );
      setSelectedCategories(currentCategory ? [currentCategory] : []);
    }
  }, [categories]);

  const handleAddItem = async () => {
    const updatedNewItem = {
      ...newItem,
      units: newItem.units,
      unit: newItem.unit,
      categoryId: selectedCategories[0].id,
      name: newItem.name.toUpperCase(),
    };
    setIsAdding(true);

    const categoryIds = selectedCategories.map((cat: any) => cat.id);
    if (addItem) {
      await addItem(updatedNewItem, categoryIds);
    }

    if (onAddTempItem) {
      onAddTempItem(updatedNewItem, selectedCategories);
    }
    setIsAdding(false);
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <BoxModal display="flex" flexDirection="column" gap={2}>
          <ModalHead
            heading="Add Item"
            buttonLabel="ADD"
            onClick={handleAddItem}
            buttonProps={{
              loading: isAdding,
            }}
            onClose={onClose}
          />

          <Divider sx={{ my: 2 }}>Item</Divider>
          <Grid
            container
            overflow="auto"
            maxHeight="80vh"
            alignItems="center"
            rowGap={2}
          >
            <Grid item xs={12}>
              <Typography>Inventory Item:</Typography>
            </Grid>
            <Grid item xs={12}>
              {defaultItem ? (
                <Typography variant="h5">
                  {newItem?.inventoryItem?.sku
                    ? `${newItem?.inventoryItem?.sku} | ${newItem?.inventoryItem?.name}`
                    : newItem?.inventoryItem?.name}
                </Typography>
              ) : (
                <Autocomplete
                  getOptionDisabled={(option: any) => {
                    if (!selectedCategories[0]) return false;
                    const isExistInCateogory =
                      selectedCategories[0]?.items?.some(
                        (item: any) => item.inventoryItemId === option.id,
                      );
                    return isExistInCateogory;
                  }}
                  options={inventoryItems?.data || []}
                  getOptionLabel={(option: any) =>
                    option?.sku
                      ? `${option?.sku} | ${option?.name}`
                      : option?.name
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Item" />
                  )}
                  value={
                    inventoryItems?.data?.find(
                      (item: any) =>
                        item.id === newItem.inventoryItemId ||
                        item.name === newItem.name,
                    ) || null
                  }
                  onChange={(e, newValue: any) => {
                    let newUnits = newValue.vendorItem.flatMap(
                      (item: any) => item.unit,
                    );

                    newUnits = Array.from(
                      new Map(
                        newUnits.map((unit: any) => [unit.ratio, unit]),
                      ).values(),
                    );
                    setNewItem({
                      ...newItem,
                      name: newValue.name || '',
                      price: newValue?.unitPrice || 0,
                      units: newUnits,
                      unit: newUnits[0],
                      inventoryItemId: newValue.id,
                    });
                  }}
                  onInputChange={(e, newInputValue) => {
                    setNewItem({ ...newItem, name: newInputValue });
                  }}
                  sx={{ width: 'auto' }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography>Name:</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </Grid>

            {newItem.units.length > 0 && (
              <UnitRadio
                units={newItem.units}
                value={JSON.stringify(newItem.unit)}
                onChange={(e: any) =>
                  setNewItem((prevState: any) => ({
                    ...prevState,
                    unit: JSON.parse(e.target.value),
                    unitId: JSON.parse(e.target.value).id,
                  }))
                }
              />
            )}

            <Grid item xs={12}>
              <Typography>Price:</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: +e.target.value })
                }
                type="number"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }}>Categories</Divider>

          <Box display="flex" flexDirection={'column'} gap={1}>
            <Typography>Assign Categories:</Typography>
            <Autocomplete
              multiple
              value={selectedCategories}
              onChange={(e: any, newValue: any) =>
                setSelectedCategories(newValue)
              }
              id="tags-standard"
              disableCloseOnSelect
              options={categories?.data || []}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Categories"
                  placeholder="Select Categories..."
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                const isDisabled = disabledCategories.some(
                  (cat: any) => cat.id === option.id,
                );
                return (
                  <li
                    key={key}
                    {...optionProps}
                    aria-disabled={isDisabled || option.id === categoryId}
                  >
                    <Checkbox
                      icon={checkBoxOutlinedIcon}
                      checkedIcon={checkedBoxOutlinedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      disabled={isDisabled || option.id === categoryId}
                    />
                    {option.name}
                  </li>
                );
              }}
            />
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
