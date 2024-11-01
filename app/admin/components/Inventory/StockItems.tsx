import {
  AlertColor,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import InventoryTable from '../Tables/InventoryTable';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import AddInventory from '../Modals/add/AddInventory';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function StockItems({ showNotification }: IProps) {
  const [isOpenAddItem, setIsOpenAddItem] = useState<boolean>(false);

  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  return (
    <>
      <AddInventory
        open={isOpenAddItem}
        onClose={() => setIsOpenAddItem(false)}
        showNotification={showNotification}
      />
      <Box display="flex" flexDirection="column">
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={10.5}>
            <TextField
              label="Search"
              placeholder="Search items by name..."
              size="small"
              variant="filled"
              fullWidth
            />
          </Grid>

          <Grid item xs={1.5}>
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

        <InventoryTable inventoryItems={inventoryItems?.data || []} />
      </Box>
    </>
  );
}
