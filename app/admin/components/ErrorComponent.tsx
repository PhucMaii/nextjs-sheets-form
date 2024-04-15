import React from 'react';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { grey } from '@mui/material/colors';

interface PropTypes {
  errorText: string;
}

export default function ErrorComponent({ errorText }: PropTypes) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      mt={4}
      sx={{width: '100%', height: '100%'}}
    >
      <ErrorOutlineIcon sx={{ color: grey[600], fontSize: 50 }} />
      <Typography fontWeight="bold" sx={{ color: grey[600] }} variant="h4">
        {errorText}
      </Typography>
    </Box>
  );
}
