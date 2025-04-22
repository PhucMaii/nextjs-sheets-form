import { Box, Typography } from '@mui/material';
import { red, yellow } from '@mui/material/colors';
import React from 'react';

export default function HolidayText() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ backgroundColor: red[800], p: 1.5, borderRadius: 2 }}
    >
      <Box
        display="flex"
        justifyContent={'center'}
        alignItems="center"
        flexDirection="column"
        gap={1}
      >
        <Typography
          variant="h6"
          textAlign={'center'}
          sx={{ color: 'white', lineHeight: 1.5 }}
          fontWeight="bold"
        >
          📢 Due to recent tariff changes from America,{' '}
          <strong
            style={{
              backgroundColor: yellow[800],
              padding: 1,
              borderRadius: 5,
            }}
          >
            BASIL
          </strong>{' '}
          price will be affected.
        </Typography>
        <Typography sx={{ color: 'white', textAlign: 'center' }}>
          Thank you for your understanding and continued support!
        </Typography>
      </Box>
      {/* <Image
        src="/images/holiday/christmas.jpeg"
        alt="holiday"
        width={100}
        height={100}
        style={{ borderRadius: 20 }}
      /> */}
    </Box>
  );
}
