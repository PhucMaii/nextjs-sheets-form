import { Typography } from '@mui/material';
import { neutral } from '@/theme/color';
import { Paper } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import React from 'react';

export default function EmptyFiles() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 8,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: neutral[50],
        border: `1px dashed ${neutral[300]}`,
      }}
    >
      <SearchIcon sx={{ fontSize: 64, color: neutral[400], mb: 2 }} />
      <Typography
        variant="h6"
        sx={{ color: neutral[700], mb: 1, fontWeight: 600 }}
      >
        No files found
      </Typography>
      <Typography variant="body2" sx={{ color: neutral[500] }}>
        Try adjusting your search or filter criteria
      </Typography>
    </Paper>
  );
}
