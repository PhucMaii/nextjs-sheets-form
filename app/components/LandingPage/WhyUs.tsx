import { landingPagePrimaryColor } from '@/constant/landingPage';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function WhyUs() {
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
          backgroundImage: 'url("/images/landing/company-truck.jpg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'brightness(50%)',
          zIndex: -1, // Ensure the pseudo-element is behind the content
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        sx={{
          maxWidth: '1000px',
          mx: 'auto',
        }}
      >
        <Typography variant="h3" textAlign="center" sx={{ color: 'white' }}>
          About Us
        </Typography>

        <Typography
          variant="h6"
          textAlign="center"
          sx={{ color: 'white', fontWeight: 'normal', lineHeight: '1.8rem' }}
        >
          Supreme Sprouts Ltd. is a trusted name in the community, dedicated to
          delivering freshness, quality, and variety since 1990. With over 35
          years of experience, we pride ourselves on providing premium-quality
          products and top-notch services.
          <br style={{ marginBottom: '1rem', marginTop: '1rem' }} />
          Our commitment to being a one-stop solution for all your restaurant
          needs sets us apart. Experience the convenience of ordering online at
          any time through our user-friendly website.
          <br style={{ marginBottom: '1rem', marginTop: '1rem' }} />
          We are proud to offer 7-day delivery to serve the Greater Vancouver,
          Burnaby, Richmond, Coquitlam, Langley, Surrey, and surrounding areas.
          Join us in our mission to elevate your dining experience with Supreme
          Sprouts.
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <Button
            onClick={() => router.push('/products')}
            variant="contained"
            sx={{ backgroundColor: landingPagePrimaryColor, color: 'white' }}
          >
            Shop now
          </Button>
          <Button
            onClick={() => router.push('/about')}
            sx={{ color: landingPagePrimaryColor }}
          >
            Learn More
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
