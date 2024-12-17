import { Box, Grid, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { CardStyled, IconBackground } from './styled';
import { grey } from '@mui/material/colors';

interface PropTypes {
  icon: ReactNode;
  text: string;
  value: number | string;
  onClick?: any;
  helperText?: string;
  backgroundColor?: string;
  textColor?: string;
  iconBackground?: string;
  extraText?: any;
  extraTextIcon?: any;
  fullHeight?: boolean;
  helperTextStyle?: any;
  extraTextStyle?: any;
}

export default function OverviewCard({
  icon,
  text,
  value,
  onClick,
  helperText,
  backgroundColor,
  textColor,
  iconBackground,
  extraText,
  extraTextIcon,
  fullHeight,
  helperTextStyle,
  extraTextStyle,
}: PropTypes) {
  return (
    <CardStyled
      sx={{
        backgroundColor: backgroundColor ? backgroundColor : 'white',
        height: fullHeight ? '100%' : 'auto',
      }}
      onClick={onClick ? onClick : null}
    >
      <Grid container spacing={2} margin={'auto'}>
        <Grid item xs={4}>
          <IconBackground $backgroundColor={iconBackground}>
            {icon}
          </IconBackground>
        </Grid>
        <Grid item xs={8}>
          <Box display="flex" alignItems="flex-end" gap={1}>
            <Typography
              fontWeight="bold"
              variant="h4"
              sx={{ color: textColor }}
            >
              {value}
            </Typography>
            {extraText && (
              <Box display="flex" alignItems="center">
                {extraTextIcon}
                <Typography variant="h6" sx={{ color: extraText.color, ...extraTextStyle }}>
                  {extraText.text}
                </Typography>
              </Box>
            )}
          </Box>
          {helperText && (
            <Typography
              fontWeight="bold"
              sx={{ color: textColor ? textColor : grey[500], ...helperTextStyle }}
              variant="subtitle1"
            >
              {helperText}
            </Typography>
          )}
          <Typography
            marginTop={helperText ? '0px' : '8px'}
            fontWeight="bold"
            sx={{
              color: textColor ? textColor : grey[500],
              width: '90% !important',
            }}
          >
            {text}
          </Typography>
        </Grid>
      </Grid>
    </CardStyled>
  );
}
