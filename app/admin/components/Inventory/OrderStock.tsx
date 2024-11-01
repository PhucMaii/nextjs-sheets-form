import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import OrderStockTable from '../Tables/OrderStockTable';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../SelectDateRange';

export default function OrderStock() {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="flex-end">
        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>
      <Grid container alignItems="center" spacing={1} mt={2}>
        <Grid item xs={10.5}>
          <TextField
            label="Search"
            placeholder="Search order by amount, date, vendor, or name..."
            size="small"
            variant="filled"
            fullWidth
          />
        </Grid>

        <Grid item xs={1.5}>
          <Button>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AddIcon />
              <Typography variant="body2" fontWeight="bold">
                New Order
              </Typography>
            </Box>
          </Button>
        </Grid>
      </Grid>

      <OrderStockTable />
    </Box>
  );
}
