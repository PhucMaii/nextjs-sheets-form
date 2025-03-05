import { blue, blueGrey, green, red, yellow } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import { ColorService } from 'react-color-palette';

const withAlphas = (color: any) => {
  return {
    ...color,
    alpha4: alpha(color.main, 0.04),
    alpha8: alpha(color.main, 0.08),
    alpha12: alpha(color.main, 0.12),
    alpha30: alpha(color.main, 0.3),
    alpha50: alpha(color.main, 0.5),
  };
};

export const neutral = {
  50: '#F8F9FA',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D2D6DB',
  400: '#9DA4AE',
  500: '#6C737F',
  600: '#4D5761',
  700: '#2F3746',
  800: '#1C2536',
  900: '#111927',
};

export const indigo = withAlphas({
  lightest: '#F5F7FF',
  light: '#EBEEFE',
  main: '#6366F1',
  dark: '#4338CA',
  darkest: '#312E81',
  contrastText: '#FFFFFF',
});

export const success = withAlphas({
  lightest: '#F0FDF9',
  light: '#69f0ae',
  main: '#00c853',
  dark: '#0B815A',
  darkest: '#134E48',
  contrastText: '#FFFFFF',
});

export const info = withAlphas({
  lightest: '#A3C2F1',
  light: '#73A6F3',
  main: '#25569F',
  dark: '#25569F',
  darkest: '#043F98',
  contrastText: '#FFFFFF',
});

export const warning = withAlphas({
  lightest: '#FFFAEB',
  light: '#FEF0C7',
  main: '#F79009',
  dark: '#B54708',
  darkest: '#7A2E0E',
  contrastText: '#FFFFFF',
});

export const error = withAlphas({
  lightest: '#FEF3F2',
  light: '#FEE4E2',
  main: '#F04438',
  dark: '#B42318',
  darkest: '#7A271A',
  contrastText: '#FFFFFF',
});

export const primary = withAlphas({
  lightest: blue[50],
  light: blue[300],
  main: blue[800],
  dark: blue[800],
  darkest: blue[900],
  contrastText: '#FFFFFF',
});

export const successColor = green[800];
export const errorColor = red[600];
export const infoColor = blue[900];
export const warningColor = yellow[900];

export const successText = green[900];
export const successBackground = green[50];

export const errorText = red[900];
export const errorBackground = red[50];

export const warningText = yellow[900];
export const warningBackground = yellow[50];

export const infoBackground = blue[50];

export const greyBackground = blueGrey[700];

export const primaryColor = blue[800];

export const handleResetColor = (color: string) => {
  return ColorService.convert('hex', color);
};
