import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { Box, Button, Typography } from '@mui/material';
import { orange } from '@mui/material/colors';
import React from 'react';

export default function InvitationSection() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={4}
      p={4}
      sx={{ backgroundColor: landingPagePrimaryColor }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        sx={{ color: 'white' }}
      >
        Let&apos;s Join Today
      </Typography>
      <Typography
        variant="h4"
        fontWeight="normal"
        textAlign="center"
        sx={{ color: 'white', lineHeight: 1.5 }}
      >
        Grow Your Business with Supreme Sprouts <br />
        Partner with Vancouver&apos;s Trusted Freshness Experts!" 🌱✨
      </Typography>
      <Button
        variant="contained"
        sx={{
          width: 'fit-content',
          fontSize: 'large',
          backgroundColor: landingPageSecondaryColor,
          px: 3,
          py: 2,
          ':hover': { backgroundColor: orange[800] },
        }}
      >
        JOIN US TODAY
      </Button>
    </Box>
  );
}
