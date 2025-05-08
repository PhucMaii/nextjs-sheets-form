import { API_URL } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import { Autocomplete, TextField } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

const useInventoryItems = () => {
  const [inventoryItems, setInventoryItems] = useState<IInventoryItem[]>([]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<
    any | null
  >(null);

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

  return {
    inventoryItems,
    selectedInventoryItem,
    renderInventoryItemSearch,
  };
};

export default useInventoryItems;
