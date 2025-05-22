import { Box, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
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
          🚧 Quick update in progress!
          <br />
          You may notice slight lag
          {/* <strong
            style={{
              backgroundColor: yellow[800],
              padding: 1,
              borderRadius: 5,
            }}
          >
            BASIL
          </strong>{' '} */}
        </Typography>
        <Typography sx={{ color: 'white', textAlign: 'center' }}>
        a quick refresh or tap Home should fix it.
        <br />
        Thank you! 💚
        </Typography>
      </Box>
    </Box>
  );
}
