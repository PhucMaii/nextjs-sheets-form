import { landingPageSecondaryColor } from '@/constant/landingPage';
import { Box, Button, Typography } from '@mui/material';
import { orange } from '@mui/material/colors';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function InvitationSection() {
  const router = useRouter();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={2}
      p={4}
      sx={{
        minHeight: '500px',
        position: 'relative',

        ':before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/images/invitation/spring-rolls.jpeg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'brightness(50%)',
          zIndex: -1, // Ensure the pseudo-element is behind the content
        },
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        sx={{
          color: 'white',
        }}
      >
        Let&apos;s Join Today
      </Typography>
      <Typography
        variant="h4"
        fontWeight="normal"
        textAlign="center"
        sx={{ lineHeight: 1.5, color: 'white' }}
      >
        Grow Your Business with Supreme Sprouts <br />
        Partner with Vancouver&apos;s Trusted Freshness Experts!" 🌱✨
      </Typography>
      <Button
        variant="contained"
        sx={{
          width: 'fit-content',
          // fontSize: 're',
          backgroundColor: landingPageSecondaryColor,
          px: 3,
          py: 2,
          ':hover': { backgroundColor: orange[800] },
        }}
        onClick={() => router.push('/application-form')}
      >
        JOIN US TODAY
      </Button>
    </Box>
  );
}
