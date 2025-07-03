import { Box, Skeleton } from '@mui/material';
import React from 'react';

export default function LoadingCard() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Skeleton variant="rounded" width="100%" height={200} />
      <Skeleton variant="text" width="95%" height={20} />
    </Box>
  );
}
