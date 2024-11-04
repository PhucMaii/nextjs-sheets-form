import { STOCK_STATUS } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import { Box, Typography } from '@mui/material';
import { green, red, yellow } from '@mui/material/colors';
import React, { useMemo } from 'react';

interface IProps {
  inventoryItems: IInventoryItem[];
}

const chartWidth = 300;
export default function StockChart({ inventoryItems }: IProps) {
  // On Stock: 20
  // Low Stock: 8
  // Out of Stock: 12
  // Total: inventoryItems?.length

  const onStock = useMemo(() => {
    return (
      inventoryItems?.filter(
        (item) => item.stockStatus === STOCK_STATUS.IN_STOCK,
      ).length || 0
    );
  }, [inventoryItems]);

  const lowStock = useMemo(() => {
    return (
      inventoryItems?.filter(
        (item) => item.stockStatus === STOCK_STATUS.LOW_STOCK,
      ).length || 0
    );
  }, [inventoryItems]);

  const outOfStock = useMemo(() => {
    return (
      inventoryItems?.filter(
        (item) => item.stockStatus === STOCK_STATUS.OUT_OF_STOCK,
      ).length || 0
    );
  }, [inventoryItems]);

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box sx={{ minWidth: chartWidth }} display="flex" gap={0.5}>
        {/* on stock box */}
        <Box
          sx={{
            width: (onStock / inventoryItems?.length) * 300,
            backgroundColor: green[700],
            height: 10,
            borderRadius: 2,
          }}
        />

        {/* low stock box */}
        <Box
          sx={{
            width: (lowStock / inventoryItems?.length) * 300,
            backgroundColor: yellow[800],
            height: 10,
            borderRadius: 2,
          }}
        />

        {/* out of stock box */}
        <Box
          sx={{
            width: (outOfStock / inventoryItems?.length) * 300,
            backgroundColor: red[700],
            height: 10,
            borderRadius: 2,
          }}
        />
      </Box>

      <Box display="flex" gap={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            width={10}
            height={10}
            bgcolor={green[700]}
            borderRadius={2}
          ></Box>
          <Typography variant="body2">On Stock: {onStock}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            width={10}
            height={10}
            bgcolor={yellow[800]}
            borderRadius={2}
          ></Box>
          <Typography variant="body2">Low Stock: {lowStock}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={10} height={10} bgcolor={red[700]} borderRadius={2}></Box>
          <Typography variant="body2">Out of stock: {outOfStock}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
