'use client';
import React from 'react';
import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import { EditIcon, FoldersIcon } from 'lucide-react';
import useInventoryItems from '@/hooks/autocomplete/useInventoryItems';
import { useCategory } from '@/hooks/autocomplete/useCategory';
import Sidebar from '../components/Sidebar/Sidebar';
import CategoryTable from '../components/Tables/CategoryTable';
import { ShadowSection } from '../reports/styled';

const ItemPage = () => {
  const { selectedInventoryItem, renderInventoryItemSearch } =
    useInventoryItems();
  const { categories, renderCategorySearch } = useCategory(
    false,
    selectedInventoryItem?.listingCategories || [],
  );

  return (
    <Sidebar>
      <Typography variant="h5">Items</Typography>

      <ShadowSection>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="subtitle1">Quick Edit</Typography>
          <EditIcon style={{ width: 16, height: 16 }} />
        </Box>
        <Divider sx={{ my: 1 }} />

        <Grid container spacing={1} alignItems="center">
          <Grid item xs={6} md={5}>
            {renderInventoryItemSearch()}
          </Grid>
          <Grid item xs={6} md={5}>
            {renderCategorySearch()}
          </Grid>
          <Grid item xs={6} md={2}>
            <Button variant="contained" color="primary">
              Search
            </Button>
          </Grid>
        </Grid>
      </ShadowSection>

      <ShadowSection>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="subtitle1">Categories</Typography>
          <FoldersIcon style={{ width: 16, height: 16 }} />
        </Box>
          <Divider sx={{ my: 1 }} />

        <CategoryTable categories={categories} />
      </ShadowSection>
    </Sidebar>
  );
};

export default ItemPage;
