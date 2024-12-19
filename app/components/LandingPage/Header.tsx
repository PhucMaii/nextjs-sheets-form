import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { Box, Button, Grid, Typography, useMediaQuery } from '@mui/material';
import { grey } from '@mui/material/colors';
import Image from 'next/image';
import React from 'react';

export default function Header() {
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  return (
    <Grid
      container
      alignItems="center"
      columnSpacing={2}
      rowGap={4}
      px={4}
      my={2}
    >
      <Grid item xs={12} md={6}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography
            variant="h2"
            fontWeight="bold"
            textAlign={mdDown ? 'center' : 'left'}
          >
            Freshness You Can Trust, Prices You'll Love
          </Typography>
          <Typography
            variant="h5"
            fontWeight="normal"
            textAlign={mdDown ? 'center' : 'left'}
            sx={{ color: grey[600], lineHeight: 1.5 }}
          >
            Delivering farm-fresh produce with unmatched quality at competitive
            prices, tailored for your business needs.
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent={mdDown ? 'center' : 'left'}
            gap={2}
          >
            <Button
              variant="contained"
              sx={{
                width: 'fit-content',
                fontSize: 'large',
                backgroundColor: landingPagePrimaryColor,
                px: 3,
                py: 2,
                ':hover': { backgroundColor: landingPageSecondaryColor },
              }}
            >
              Join Us Today
            </Button>
            <Button
              variant="outlined"
              sx={{
                width: 'fit-content',
                fontSize: 'large',
                color: landingPagePrimaryColor,
                px: 3,
                py: 2,
                ':hover': {
                  backgroundColor: landingPageSecondaryColor,
                  color: 'white',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} textAlign="center">
        <Image
          src="/images/landing/person_delivery.jpeg"
          alt="header"
          width={300}
          height={400}
          style={{ borderRadius: 50 }}
          priority={true}
          sizes="100vw"
        />
      </Grid>
    </Grid>
  );
}
