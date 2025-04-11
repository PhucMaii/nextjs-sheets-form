import { Box, Popover, Typography } from '@mui/material';
import React from 'react';

interface Props {
    anchorEl: any;
    listing: string[];
    onClose: () => void
}

export default function DisplayListingCategory({ anchorEl, listing }: Props) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{
        maxHeight: '80vh',
        p: 2,
        '&MuiPaper-root': {
          p: 2
        },
      }}
    >
      <Box display="flex" flexDirection="column" gap={2} p={2}>
        {listing.length > 0 &&
          listing.map((item: string, idx: number) => <Typography key={idx}>{item}</Typography>)}
      </Box>
    </Popover>
  );
}
