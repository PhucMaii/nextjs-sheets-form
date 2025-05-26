import { Box, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import React from 'react';

interface IProps {
  shift: any;
}

export default function Shift({ shift }: IProps) {
  return (
    <Box
      display="flex"
    //   width="100%"
      flexDirection="column"
      gap={1}
      sx={{ backgroundColor: blue[50], p: 1, borderRadius: 1, width: 'fit-content' }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {shift?.startedAt}
        </Typography>{' '}
        -{' '}
        <Typography variant="body1" fontWeight="bold">
          {shift?.endedAt}
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          ({shift?.hours}h)
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body1">{shift?.employee?.role}</Typography>
      </Box>
    </Box>
  );
}
