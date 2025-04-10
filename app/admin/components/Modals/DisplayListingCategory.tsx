import { Box, Popover, Typography } from '@mui/material';
import React from 'react';

interface Props {
    anchorEl: any;
    listing: string[];
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
    >
      <Box display="flex" flexDirection="column" gap={2}>
        {listing.length > 0 &&
          listing.map((item: string, idx: number) => <Typography key={idx}>{item}</Typography>)}
      </Box>
    </Popover>
  );
}
