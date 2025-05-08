import { API_URL } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState, useCallback, useMemo } from 'react';

const useInventoryItems = () => {
  const [inventoryItems, setInventoryItems] = useState<IInventoryItem[]>([]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<
    any | null
  >(null);
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<any[]>(
    [],
  );

  console.log('re fetch inventory items');
  
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/inventory`);

      if (response.data.error) {
        return;
      }

      setInventoryItems(response.data.data);
    } catch (error: any) {
      console.log('Error fetching inventory items', error);
    }
  };

  const renderMultipleInventoryItemSearch = useCallback(() => {
    return (
      <Autocomplete
        size="small"
        options={inventoryItems || []}
        getOptionLabel={(option: any) => {
          return option?.sku
            ? `${option?.sku} | ${option?.name}`
            : option?.name;
        }}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <FormControlLabel
                label={
                  option?.sku
                    ? `${option?.sku} | ${option?.name}`
                    : option?.name
                }
                control={<Checkbox checked={selected} />}
                onClick={(e) => {
                  // e.stopPropagation();
                  e.preventDefault();
                }}
              />
            </li>
          );
        }}
        limitTags={3}
        renderInput={(params) => <TextField {...params} label="Search Items" />}
        multiple
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue) => {
          const newSelectedInventoryItems = newValue.map((item: any) => {
            const newUnits = item.vendorItem.flatMap((item: any) => item.unit);
            const uniqueUnits = Array.from(
              new Map(newUnits.map((unit: any) => [unit.ratio, unit])).values(),
            );
            return {
              ...item,
              unit: uniqueUnits[0],
              units: uniqueUnits,
            };
          });
          setSelectedInventoryItems(newSelectedInventoryItems);
        }}
        disableCloseOnSelect
        value={selectedInventoryItems}
        // openOnFocus
      />
    );
  }, [inventoryItems, selectedInventoryItems]);

  const renderInventoryItemSearch = () => {
    return (
      <Autocomplete
        options={inventoryItems || []}
        getOptionLabel={(option: any) =>
          option?.sku ? `${option?.sku} | ${option?.name}` : option?.name
        }
        renderInput={(params) => <TextField {...params} label="Item" />}
        value={
          inventoryItems?.find(
            (item: any) =>
              item.id === selectedInventoryItem?.id ||
              item.name === selectedInventoryItem?.name,
          ) || null
        }
        onChange={(e, newValue: any) => {
          let newUnits = newValue.vendorItem.flatMap((item: any) => item.unit);

          newUnits = Array.from(
            new Map(newUnits.map((unit: any) => [unit.ratio, unit])).values(),
          );
          setSelectedInventoryItem({
            ...newValue,
            units: newUnits,
            unit: newUnits[0],
            inventoryItemId: newValue.id,
          });
        }}
        sx={{ width: 'auto' }}
      />
    );
  };

  return useMemo(() => {
    return {
      inventoryItems,
      selectedInventoryItem,
      selectedInventoryItems,
      setSelectedInventoryItems,
      renderInventoryItemSearch,
      renderMultipleInventoryItemSearch,
    };
  }, [inventoryItems, selectedInventoryItem, selectedInventoryItems]);
};

export default useInventoryItems;
