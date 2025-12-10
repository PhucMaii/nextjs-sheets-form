import { Box, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import React from 'react';

// const highlightStyle = {
//   backgroundColor: yellow[800],
//   padding: 1,
//   borderRadius: 5,
// };

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
          {/* <strong style={highlightStyle}>
            All Eggs
          </strong>{' '} price will be <br />
          increased by next week */}
          We will be closed on Dec 25th and Jan 1st.
        </Typography>
        <Typography sx={{ color: 'white', textAlign: 'center' }}>
          We truly appreciate <br /> your support and understanding! 💚
        </Typography>
      </Box>
    </Box>
  );
}
