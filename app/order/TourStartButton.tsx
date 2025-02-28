import React from 'react';
import { useTour } from '@reactour/tour';
import { Box, Button, Typography } from '@mui/material';
import { InfoIcon } from 'lucide-react';

const TourStartButton = () => {
  const { setIsOpen } = useTour();
  return (
    <Button
      sx={{ width: 'fit-content' }}
      variant="contained"
      onClick={() => setIsOpen(true)}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <InfoIcon style={{ width: 20, height: 20 }} />
        <Typography variant="body2" sx={{ fontSize: 15 }} fontWeight="bold">
          Explore our new system
        </Typography>
      </Box>
    </Button>
  );
};

export default TourStartButton;
