import {
  AlertColor,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import InventoryTable from '../Tables/InventoryTable';
import AddInventory from '../Modals/add/AddInventory';
import useDebounce from '@/hooks/useDebounce';
import { IInventoryItem } from '@/app/utils/type';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  inventoryItems: any;
}

export default function StockItems({
  showNotification,
  inventoryItems,
}: IProps) {
  const [displayData, setDisplayData] = useState<IInventoryItem[]>([]);
  const [isOpenAddItem, setIsOpenAddItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  //   const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  useEffect(() => {
    if (inventoryItems) {
      setIsLoading(false);
      setDisplayData(inventoryItems?.data || []);
    } else {
      setIsLoading(true);
    }
  }, [inventoryItems]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newDisplayData = inventoryItems?.data.filter(
        (item: IInventoryItem) => {
          return (
            item.name.toLowerCase().includes(debouncedKeywords.toLowerCase()) ||
            item.vendorItem.some((vendorItem: any) =>
              vendorItem.vendor.name
                .toLowerCase()
                .includes(debouncedKeywords.toLowerCase()),
            )
          );
        },
      );

      setDisplayData(newDisplayData);
    } else {
      setDisplayData(inventoryItems?.data || []);
    }
  }, [debouncedKeywords, inventoryItems?.data]);

  return (
    <>
      <AddInventory
        open={isOpenAddItem}
        onClose={() => setIsOpenAddItem(false)}
        showNotification={showNotification}
      />
      <Box display="flex" flexDirection="column">
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={12} md={10.5}>
            <TextField
              label="Search"
              placeholder="Search items by name..."
              size="small"
              variant="filled"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={1.5} textAlign="right">
            <Button onClick={() => setIsOpenAddItem(true)}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <AddIcon />
                <Typography variant="body2" fontWeight="bold">
                  New Item
                </Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>

        {isLoading ? (
          <LoadingComponent />
        ) : (
          <InventoryTable
            inventoryItems={displayData}
            showNotification={showNotification}
          />
        )}
      </Box>
    </>
  );
}
