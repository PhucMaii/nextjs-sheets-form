// eslint-disable @typescript-eslint/no-explicit-any
'use client';
import { createTheme as createMuiTheme } from '@mui/material';
import { createTypography } from './create-typography';
import { createPalette } from './create-palette';

export function createTheme() {
  const typography: any = createTypography();
  const palette: any = createPalette();

  return createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1440,
      },
    },
    palette,
    shape: {
      borderRadius: 8,
    },
    typography,
  });
}

export const theme = createTheme();
