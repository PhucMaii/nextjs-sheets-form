import { Divider, IconButton } from '@mui/material';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';
import React from 'react';
import UnitRadio from '../../components/Radio/UnitRadio';
import { Trash2Icon } from 'lucide-react';

interface VariantRowProps {
  variant: any;
  setVariants: (variants: any[]) => void;
  variants: any[];
  item: any;
  // onChangeVariant: (variant: any) => void;
}

export default function VariantRow({
  variant,
  item,
  variants,
  setVariants,
}: VariantRowProps) {
  const onChangeVariant = (variant: any) => {
    const newOptions = variants.map((option: any) => {
      if (option.id === variant.id) {
        return variant;
      }
      return option;
    });

    setVariants(newOptions);
  };

  const onRemoveVariant = () => {
    console.log('onRemoveVariant', variants);
    const newOptions = variants.filter(
      (option: any) => option.id !== variant.id,
    );
    setVariants(newOptions);
  };

  return (
    <>
      <Grid item xs={12} md={0.6}>
        <Checkbox />
      </Grid>
      <Grid item xs={12} md={2.6}>
        <Box display="flex" gap={1} alignItems="center">
          <FormControl fullWidth>
            <InputLabel htmlFor="variants">Variants</InputLabel>
            <OutlinedInput
              fullWidth
              placeholder="Variant"
              value={variant?.name || ''}
              label="Variant"
              onChange={(e) =>
                onChangeVariant({ ...variant, name: e.target.value })
              }
            />
          </FormControl>
        </Box>
      </Grid>

      <Grid item xs={12} md={2.6}>
        <Box display="flex" gap={1} alignItems="center">
          <FormControl fullWidth>
            <InputLabel htmlFor="variants">Price</InputLabel>
            <OutlinedInput
              fullWidth
              placeholder="Enter price"
              value={variant?.price || 0}
              label="Price"
              onChange={(e) =>
                onChangeVariant({ ...variant, price: +e.target.value })
              }
            />
          </FormControl>
        </Box>
      </Grid>
      <Grid item xs={12} md={2.6}>
        <Box display="flex" gap={1} alignItems="center">
          <FormControl fullWidth>
            <InputLabel htmlFor="variants">Previous Price</InputLabel>
            <OutlinedInput
              fullWidth
              placeholder="Enter price"
              value={variant?.prevPrice || 0}
              label="Previous Price"
              onChange={(e) =>
                onChangeVariant({ ...variant, prevPrice: +e.target.value })
              }
            />
          </FormControl>
        </Box>
      </Grid>
      <Grid item xs={12} md={2.8}>
        <FormControlLabel
          control={
            <Checkbox
              checked={variant?.isShowDiscount || false}
              //   onChange={(e) =>
              //     setItem((prev: any) => ({
              //       ...prev,
              //       isShowDiscount: e.target.checked,
              //     }))
              //   }
              onChange={(e) =>
                onChangeVariant({
                  ...variant,
                  isShowDiscount: e.target.checked,
                })
              }
            />
          }
          label="Show Discount"
          sx={{ mt: 1, px: '9px' }} // to be aligned with the checkbox
        />
      </Grid>
      <Grid item xs={12} md={0.8}>
        <IconButton onClick={onRemoveVariant}>
          <Trash2Icon style={{ width: '20px' }} />
        </IconButton>
      </Grid>

      <Grid item xs={12}>
        <UnitRadio
          units={item?.units || []}
          value={JSON.stringify(variant?.unit || {})}
          onChange={(e: any) =>
            onChangeVariant({
              ...variant,
              unit: JSON.parse(e.target.value),
              unitId: JSON.parse(e.target.value).id,
            })
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
      </Grid>
    </>
  );
}
