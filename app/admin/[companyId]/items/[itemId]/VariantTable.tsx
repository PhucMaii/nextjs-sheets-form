import { IInventoryUnit } from '@/app/utils/type';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import React from 'react';

// Interfaces following your naming conventions

interface Variant {
  id: number;
  name: string;
  price: number;
  prevPrice?: number;
  isShowDiscount: boolean;
  unit: IInventoryUnit;
  availability?: boolean;
}

interface VariantTableProps {
  variants: Variant[];
}

const calculateDiscountPercentage = (
  price: number,
  prevPrice: number,
): number => {
  return Math.round(((prevPrice - price) / prevPrice) * 100);
};

const PriceDisplay: React.FC<{
  price: number;
  prevPrice?: number;
  isShowDiscount: boolean;
}> = ({ price, prevPrice, isShowDiscount }) => {
  const hasDiscount = isShowDiscount && prevPrice && prevPrice > price;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" fontWeight="medium">
        ${price}
      </Typography>
      {hasDiscount && (
        <>
          <Typography
            variant="body2"
            sx={{
              textDecoration: 'line-through',
              color: 'text.secondary',
              fontSize: '0.875rem',
            }}
          >
            ${prevPrice}
          </Typography>
          <Chip
            label={`-${calculateDiscountPercentage(price, prevPrice)}%`}
            size="small"
            color="error"
            variant="outlined"
          />
        </>
      )}
    </Box>
  );
};

const VariantRow: React.FC<{
  variant: Variant;
}> = ({ variant }) => {
  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {variant.name}
        </Typography>
      </TableCell>
      <TableCell>
        <PriceDisplay
          price={variant.price}
          prevPrice={variant.prevPrice}
          isShowDiscount={variant.isShowDiscount}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {variant.prevPrice ? `$${variant.prevPrice}`: '—'}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={variant.isShowDiscount ? 'Yes' : 'No'}
          size="small"
          color={variant.isShowDiscount ? 'success' : 'default'}
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          1:{variant.unit.ratio} - {variant.unit.unit}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const EmptyState: React.FC = () => (
  <TableRow>
    <TableCell colSpan={5} align="center">
      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
        No variants found
      </Typography>
    </TableCell>
  </TableRow>
);

export default function VariantTable({ variants }: VariantTableProps) {
  const hasVariants = variants && variants.length > 0;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Price
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Previous Price
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Show Discount
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Unit
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hasVariants ? (
            variants.map((variant) => (
              <VariantRow key={variant.id} variant={variant} />
            ))
          ) : (
            <EmptyState />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Export types for use in parent components
export type { Variant, VariantTableProps };
