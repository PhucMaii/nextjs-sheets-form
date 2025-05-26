import { Box, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import React from 'react';

interface IProps {
  shift: any;
}

export default function Shift({ shift }: IProps) {
  const formatTime = (time: string) => {
    if (!time) return '';

    return time.split(' ')[1].slice(0, 5);
  };

  return (
    <Box
      display="flex"
      width="100%"
      flexDirection="column"
      // alignItems="center"
      justifyContent="center"
      gap={0.2}
      sx={{ backgroundColor: blue[50], py: 0.5, px: 0.5, borderRadius: 1 }}
    >
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="body2" fontWeight="bold">
          {formatTime(shift?.startedAt)}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          -
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {formatTime(shift?.endedAt)}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          • {shift?.hours}h
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="caption">{shift?.role}</Typography>
      </Box>
    </Box>
  );
}
