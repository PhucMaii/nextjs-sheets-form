import { alpha, Box, Typography, Chip } from '@mui/material';
import React from 'react';
import { Package } from 'lucide-react';
import { IInventoryItem } from '@/app/utils/type';

interface IProps {
  item: IInventoryItem;
  onClick: () => void;
  isSelected: boolean;
  itemCount?: number | null;
}

export default function ItemSelector({
  item,
  onClick,
  isSelected,
  itemCount,
}: IProps) {
  return (
    <Box
      key={item.id}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        border: isSelected ? '2px solid #3B82F6' : '1px solid #E5E7EB',
        borderRadius: 1.5,
        transition: 'all 0.2s ease',
        bgcolor: isSelected ? alpha('#3B82F6', 0.05) : 'transparent',
        '&:hover': {
          borderColor: '#3B82F6',
          bgcolor: alpha('#3B82F6', 0.05),
        },
      }}
      onClick={onClick}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: alpha('#3B82F6', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Package size={14} color="#3B82F6" />
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" fontWeight={600} noWrap>
              {item.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              noWrap
            >
              {item.sku}
            </Typography>
          </Box>
        </Box>

        {itemCount && (
          <Chip
            label={`Count: ${itemCount}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
}
