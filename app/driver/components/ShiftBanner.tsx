import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IShiftSession } from '@/app/utils/type';

interface IProps {
  shift: IShiftSession | null;
  onOpenShiftModal: () => void;
}

export default function ShiftBanner({ shift, onOpenShiftModal }: IProps) {
  return (
    <Box
      width="100%"
      sx={{
        backgroundColor: 'primary.lightest',
        p: 2,
      }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={1}
    >
      <Typography
        variant="body2"
        fontWeight="semibold"
        sx={{ color: 'primary.main' }}
      >
        Shift started at {shift?.startedAt}
      </Typography>
      <IconButton
        onClick={onOpenShiftModal}
        size="small"
        sx={{ color: 'primary.main' }}
      >
        <AccessTimeIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
