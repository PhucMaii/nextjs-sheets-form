import { common } from '@mui/material/colors';
import { error, info, neutral, primary, success, warning } from './color';
import { alpha } from '@mui/material';

export function createPalette() {
  return {
    action: {
      active: neutral[500],
      disabled: alpha(neutral[900], 0.38),
      disabledBackground: alpha(neutral[900], 0.12),
      focus: alpha(neutral[900], 0.16),
      hover: alpha(neutral[900], 0.04),
      selected: alpha(neutral[900], 0.12),
    },
    background: {
      default: common.white,
      paper: common.white,
    },
    error,
    info,
    mode: 'light',
    neutral,
    primary: primary,
    success,
    // text: {
    //   primary: neutral[700],
    //   secondary: neutral[500],
    //   disabled: alpha(neutral[900], 0.38),
    // },
    warning,
  };
}