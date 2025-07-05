'use client';
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Grid, TextField, Typography } from '@mui/material';
import { ShadowSection } from '../../reports/styled';

const CreateInventory = () => {
  const [newInventoryItem, setNewInventoryItem] = useState<any>({
    name: '',
    sku: '',
  });
  return (
    <Sidebar>
      <Typography variant="h5">Create Inventory</Typography>

      <ShadowSection>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={8}>
            <TextField
              label="Name"
              fullWidth
              value={newInventoryItem.name}
              onChange={(e) =>
                setNewInventoryItem((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              label="SKU"
              fullWidth
              value={newInventoryItem.sku}
              onChange={(e) =>
                setNewInventoryItem((prev: any) => ({
                  ...prev,
                  sku: e.target.value,
                }))
              }
            />
          </Grid>
        </Grid>
      </ShadowSection>
    </Sidebar>
  );
};

export default CreateInventory;
