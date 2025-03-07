import { Box, Grid, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { CardStyled, IconBackground } from './styled';
import { grey } from '@mui/material/colors';

interface PropTypes {
  icon?: ReactNode;
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
        {!icon && (
          <Grid item xs={12}>
            <Typography
              marginTop={helperText ? '0px' : '8px'}
              sx={{
                color: textColor ? textColor : grey[600],
                width: '90% !important',
              }}
            >
              {text}
            </Typography>
          </Grid>
        )}
        {icon && (
          <Grid item xs={4}>
            <IconBackground $backgroundColor={iconBackground}>
              {icon}
            </IconBackground>
          </Grid>
        )}
        <Grid item xs={icon ? 8 : 12}>
          <Box display="flex" alignItems="flex-end" gap={1}>
            <Typography
              fontWeight="bold"
              variant="h3"
              sx={{ color: textColor }}
            >
              {value}
            </Typography>
            {extraText && (
              <Box display="flex" alignItems="center">
                {extraTextIcon}
                <Typography
                  variant="h6"
                  fontWeight="regular"
                  sx={{ color: extraText.color, ...extraTextStyle }}
                >
                  {extraText.text}
                </Typography>
              </Box>
            )}
          </Box>
          {helperText && (
            <Typography
              fontWeight="bold"
              sx={{
                color: textColor ? textColor : grey[500],
                ...helperTextStyle,
              }}
              variant="subtitle1"
            >
              {helperText}
            </Typography>
          )}
          {icon && <Typography
            marginTop={helperText ? '0px' : '8px'}
            sx={{
              color: textColor ? textColor : grey[600],
              width: '90% !important',
            }}
          >
            {text}
          </Typography>}
        </Grid>
      </Grid>
    </CardStyled>
  );
}
