import { Grid, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { CardStyled, IconBackground } from './styled';
import { grey } from '@mui/material/colors';

interface PropTypes {
  icon: ReactNode;
  text: string;
  value: number | string;
}

export default function OverviewCard({ icon, text, value }: PropTypes) {
  return (
    <CardStyled>
      <Grid container spacing={2} margin={'auto'}>
        <Grid item xs={5}>
          <IconBackground>{icon}</IconBackground>
        </Grid>
        <Grid item xs={7}>
          <Typography fontWeight="bold" variant="h4">
            {value}
          </Typography>
          <Typography
            marginTop={'8px'}
            fontWeight="bold"
            sx={{ color: grey[500] }}
          >
            {text}
          </Typography>
        </Grid>
      </Grid>
    </CardStyled>
  );
}
