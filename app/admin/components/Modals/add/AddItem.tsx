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
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import useEditUnit from '@/hooks/unit/useEditUnit';
import {
  checkBoxOutlinedIcon,
  checkedBoxOutlinedIcon,
} from '../../Autocomplete/VendorSearch';

interface IProps extends ModalProps {
  categoryId?: number;
  addItem: any;
  showNotification: (type: AlertColor, message: string) => void;
  defaultItem?: any;
}

export default function AddItem({
  open,
  onClose,
  categoryId,
  addItem,
  showNotification,
  defaultItem,
}: IProps) {
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

  const { units, selectedUnit, AddUnitModal, EditUnitModal, UnitDisplay } =
    useEditUnit(newItem.units, newItem.unit, showNotification, true);

  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);
  const [categories] = SWRFetchData(API_URL.CATEGORIES);

  useEffect(() => {
    if (defaultItem) {
      setNewItem((prevItem: any) => {
        return { ...prevItem, ...defaultItem };
      });
    }
  }, [defaultItem]);

  console.log(newItem, 'newItem');

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
      units,
      unit: selectedUnit,
      name: newItem.name.toUpperCase(),
    };
    setIsAdding(true);

    const categoryIds = selectedCategories.map((cat: any) => cat.id);
    await addItem(updatedNewItem, categoryIds);
    setIsAdding(false);
  };

  return (
    <>
      {AddUnitModal}
      {EditUnitModal}
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
          <Divider sx={{ my: 2 }}>Categories</Divider>

          <Box display="flex" flexDirection={'column'} gap={1}>
            <Typography variant="h6">New Item Categories:</Typography>
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
                return (
                  <li
                    key={key}
                    {...optionProps}
                    aria-disabled={option.id === categoryId}
                  >
                    <Checkbox
                      icon={checkBoxOutlinedIcon}
                      checkedIcon={checkedBoxOutlinedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      disabled={option.id === categoryId}
                    />
                    {option.name}
                  </li>
                );
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }}>Item</Divider>
          <Grid
            container
            overflow="auto"
            maxHeight="80vh"
            alignItems="center"
            rowGap={2}
          >
            <Grid item xs={12}>
              <Typography variant="h6">Inventory Item:</Typography>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={inventoryItems?.data || []}
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => <TextField {...params} label="Item" />}
                value={
                  inventoryItems?.data?.find(
                    (item: any) => (item.id === newItem.inventoryItemId || item.name === newItem.name),
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
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Name:</Typography>
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

            {newItem.units.length > 0 && UnitDisplay}

            <Grid item xs={12}>
              <Typography variant="h6">Price:</Typography>
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
        </BoxModal>
      </Modal>
    </>
  );
}
