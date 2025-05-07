'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ClipboardPasteIcon } from 'lucide-react';
import { ShadowSection } from '../../reports/styled';
import QuoteItemTable from '../../components/Tables/QuoteItemTable';
import useInventoryItems from '@/hooks/autocomplete/useInventoryItems';
import PasteCategory from '../../components/Modals/PasteCategory';

export default function CreateQuotePage() {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const router = useRouter();
  const [isOpenPasteCategory, setIsOpenPasteCategory] = useState<boolean>(false);
  const {
    inventoryItems,
    selectedInventoryItems,
    renderMultipleInventoryItemSearch,
    setSelectedInventoryItems,
  } = useInventoryItems(true);

  useEffect(() => {
    const newSelectedItems = selectedInventoryItems.map((item) => {
      const isExistInSelected = selectedItems.find(
        (selectedItem) => selectedItem.id === item.id,
      );
      if (isExistInSelected) {
        return isExistInSelected;
      }

      return {
        ...item,
        quantity: 1,
        price: 0,
      };
    });
    setSelectedItems(newSelectedItems);
  }, [selectedInventoryItems]);

  const onPasteCategory = (category: any) => {
    const newSelectedItems = category.items.map((item: any) => {
      const inventoryItem = inventoryItems.find((inventoryItem: any) => inventoryItem.id === item.inventoryItemId);
      if (!inventoryItem) {
        return null;
      }

      return inventoryItem;
    }).filter((item: any) => item !== null);

    setSelectedInventoryItems(newSelectedItems);
  };

  const onUpdateItem = (item: any) => {
    const newSelectedItems = selectedItems.map((selectedItem) => {
      if (selectedItem.id === item.id) {
        return item;
      }

      return selectedItem;
    });

    setSelectedItems(newSelectedItems);
  };

  const onRemoveItem = (item: any) => {
    const newSelectedItems = selectedInventoryItems.filter(
      (selectedItem) => selectedItem.id !== item.id,
    );
    setSelectedInventoryItems(newSelectedItems);
  };

  return (
    <Sidebar>
      <PasteCategory 
        open={isOpenPasteCategory}
        onClose={() => setIsOpenPasteCategory(false)}
        onPaste={onPasteCategory}
      />
      <Box display="flex" alignItems="center">
        <IconButton onClick={() => router.push('/admin/quotes')}>
          <ArrowLeftIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="semibold">
          Create Quote
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {/* Item Details */}
          <ShadowSection display="flex" flexDirection="column" gap={2}>
            <Typography variant="body1" fontWeight="semibold">
              Item Details
            </Typography>
            <Grid container>
              <Grid item xs={11} md={11.5}>
                {renderMultipleInventoryItemSearch()}
              </Grid>
              <Grid item xs={1} md={0.5}>
                <IconButton onClick={() => setIsOpenPasteCategory(true)}>
                  <ClipboardPasteIcon />
                </IconButton>
              </Grid>
            </Grid>

            <QuoteItemTable
              selectedItems={selectedItems}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
            />
          </ShadowSection>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Customer Details */}
          <ShadowSection>
            <Typography variant="body1" fontWeight="semibold">
              Customer Details
            </Typography>
          </ShadowSection>
        </Grid>
      </Grid>
    </Sidebar>
  );
}
