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
import OrderStockTable from '../Tables/OrderStockTable';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../Select/SelectDateRange';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps {
  openAddStockPurchased: () => void;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function OrderStock({
  openAddStockPurchased,
  showNotification,
}: IProps) {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [expenses] = SWRFetchData(
    `${API_URL.ADMIN}/inventory/expenses?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  useEffect(() => {
    if (expenses) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [expenses]);

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
          <Button onClick={openAddStockPurchased}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AddIcon />
              <Typography variant="body2" fontWeight="bold">
                New Order
              </Typography>
            </Box>
          </Button>
        </Grid>
      </Grid>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <OrderStockTable
          stockOrders={expenses?.data || []}
          showNotification={showNotification}
        />
      )}
    </Box>
  );
}
