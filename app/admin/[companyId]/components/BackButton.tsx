import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowBackIosNew } from '@mui/icons-material';

const BackButton = () => {
    const router = useRouter()
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton onClick={() => router.back()}>
        <ArrowBackIosNew />
      </IconButton>
      <Typography variant="caption" color="text.secondary">
        Back
      </Typography>
    </Box>
  );
};

export default BackButton;
