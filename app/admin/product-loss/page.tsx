'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import ProductLossTable from '../components/Tables/ProductLossTable';
import { ShadowSection } from '../reports/styled';
import AddProductLoss from '../components/Modals/add/AddProductLoss';
import useNotification from '@/hooks/useNotification';
import { IProductLoss } from '@/app/utils/type';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { fetchApi } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';

export default function ProductLoss() {
  const [isOpenProductLoss, setIsOpenProductLoss] = useState<boolean>(false);
  const [productLossList, setProductLossList] = useState<IProductLoss[]>([]);
  const [dateRange, setDateRange] = useState<any>(generateMonthRange());

  const { showNotification, NotificationComp } = useNotification();

  const fetchProductLossList = async () => {
    const data = await fetchApi(
      `${API_URL.ADMIN}/product-loss?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
      showNotification,
    );

    setProductLossList(data);
  };

  useEffect(() => {
    fetchProductLossList();
  }, [dateRange]);

  return (
    <Sidebar>
      {NotificationComp}
      {isOpenProductLoss && (
        <AddProductLoss
          open={isOpenProductLoss}
          onClose={() => setIsOpenProductLoss(false)}
          showNotification={showNotification}
          refresh={fetchProductLossList}
        />
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Product Loss</Typography>
        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>

      <ShadowSection display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={10.5} xl={11.5}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={1.5} xl={0.5}>
            <Button
              onClick={() => setIsOpenProductLoss(true)}
              fullWidth
              variant="contained"
              color="primary"
            >
              + Report Loss
            </Button>
          </Grid>
        </Grid>

        <ProductLossTable productLossList={productLossList} />
      </ShadowSection>
    </Sidebar>
  );
}
