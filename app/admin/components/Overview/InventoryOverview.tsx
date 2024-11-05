import { Box, Divider, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StockChart from '../Charts/StockChart';
import { grey } from '@mui/material/colors';
import { IInventoryItem } from '@/app/utils/type';
import { minifyNumber } from '@/app/utils/number';

interface IProps {
  inventoryItems: IInventoryItem[];
}

export default function InventoryOverview({ inventoryItems }: IProps) {
  const totalAssetValue = useMemo(() => {
    return inventoryItems.reduce((acc, item) => acc + item.totalValue, 0);
  }, [inventoryItems]);

  return (
    <Box display="flex" alignItems="center" gap={4}>
      <Box p={2}>
        <Box display="flex" gap={2} flexDirection="column">
          <Box display="flex" gap={1} alignItems="center">
            <MonetizationOnIcon sx={{ fontSize: 30 }} color="primary" />
            <Typography variant="subtitle2" fontWeight="bold" color={grey[500]}>
              TOTAL ASSET VALUE
            </Typography>
          </Box>

          <Typography variant="h3">
            ${minifyNumber(totalAssetValue) || 0}
          </Typography>
        </Box>
      </Box>

      <Divider orientation="vertical" />

      <Box display="flex" gap={2} flexDirection="column">
        <Typography variant="h6" fontWeight="bold">
          {inventoryItems?.length} Products
        </Typography>
        <StockChart inventoryItems={inventoryItems} />
      </Box>
    </Box>
  );
}
