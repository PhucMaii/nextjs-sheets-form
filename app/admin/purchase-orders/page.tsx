'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import SelectDateRange from '../components/Select/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import { ShadowSection } from '../reports/styled';
import POTable from '../components/Tables/POTable';
import { useRouter } from 'next/navigation';

export default function PurchaseOrders() {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const router = useRouter();
  
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
            <Button onClick={() => router.push('/admin/purchase-orders/create')} variant="contained">+ Create</Button>
          </Grid>
        </Grid>
        <POTable />
      </ShadowSection>
    </Sidebar>
  );
}
