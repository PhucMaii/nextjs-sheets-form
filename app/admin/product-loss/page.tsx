'use client';
import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Button, Grid, TextField, Typography } from '@mui/material';
import ProductLossTable from '../components/Tables/ProductLossTable';
import { ShadowSection } from '../reports/styled';

export default function ProductLoss() {
  return (
    <Sidebar>
      <Typography variant="h5">Product Loss</Typography>

      <ShadowSection display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={10.5} xl={11.5}>
            <TextField label="Search" variant="outlined" size="small" fullWidth />
        </Grid>
        <Grid item xs={1.5} xl={0.5}>
          <Button fullWidth variant="contained" color="primary">
            + Report Loss
          </Button>
        </Grid>
      </Grid>

      <ProductLossTable />
      </ShadowSection>
    </Sidebar>
  );
}
