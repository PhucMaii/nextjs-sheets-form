'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import SelectDateRange from '../components/Select/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import { ShadowSection } from '../reports/styled';
import POTable from '../components/Tables/POTable';
import { useRouter } from 'next/navigation';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { IPurchaseOrder } from '@/app/utils/type';

export default function PurchaseOrders() {
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [poList, setPoList] = useState<IPurchaseOrder[]>([]);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());

  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purchaseOrders, _mutate, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/purchase-orders?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  useEffect(() => {
    if (purchaseOrders && !isValidating) {
      setPoList(purchaseOrders.data);
      setIsInitialized(false);
    } else if (!purchaseOrders && isValidating) {
      setIsInitialized(true);
    }
  }, [purchaseOrders, isValidating]);

  return (
    <Sidebar>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="semibold">
          Purchase Orders
        </Typography>
        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>

      <ShadowSection>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={10.5}>
            <TextField
              label="Search"
              placeholder="Search order by amount, date, vendor, or name..."
              size="small"
              fullWidth
              // sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={1.5}>
            <Button
              onClick={() => router.push('/admin/purchase-orders/create')}
              variant="contained"
            >
              + Create
            </Button>
          </Grid>
        </Grid>
        {isInitialized ? (
          <Skeleton variant="rectangular" height={500} />
        ) : (
          <POTable poList={poList} />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
