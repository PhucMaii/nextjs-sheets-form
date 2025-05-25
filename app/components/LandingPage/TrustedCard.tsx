import { TrustedType } from '@/constant/landingPage';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

type Props = {
  trusted: TrustedType;
};

export default function TrustedCard({ trusted }: Props) {
  return (
    <Grid
      container
      alignItems="start"
      columnGap={2}
      sx={{
        border: 1,
        borderColor: 'lightgrey',
        borderRadius: 2,
        padding: 2,
        // width: 500,
        minHeight: 200,
      }}
    >
      <Grid item xs={2}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{
            width: 80,
            height: 70,
            borderRadius: 10,
            backgroundColor: trusted.iconBackground,
          }}
        >
          <trusted.icon style={{ width: 40, height: 40 }} />
        </Box>
      </Grid>
      <Grid item xs={9}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Typography variant="h4" fontWeight="bold">
            {trusted.title}
          </Typography>
          <Typography variant="h5" fontWeight="normal" sx={{ lineHeight: 1.5 }}>
            {trusted.description}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
