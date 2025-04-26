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
        lg: 1250,
        xl: 1800,
      },
    },
    palette,
    shape: {
      borderRadius: 8,
    },
    typography,
    components: {
      MuiButton: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small', // Set default size to 'small'
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small', // Default size for Select
        },
      },
      MuiListItemButton: {
        defaultProps: {
          dense: true, // Makes the ListItemButton smaller
        },
        styleOverrides: {
          root: {
            paddingTop: 4,
            paddingBottom: 4,
            '& .MuiListItemIcon-root': {
              minWidth: '32px', // Reduce the default spacing between icon and text
              marginRight: 4, // Adjust margin for smaller gap
            },
          },
        },
      },
    },
  });
}

export const theme = createTheme();
