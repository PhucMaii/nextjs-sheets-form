import React from 'react';
import StatusText from './StatusText';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function ExceedingCODButton({
  cashDiff,
  onCheckCOD,
}: {
  cashDiff: number;
  onCheckCOD: () => void;
}) {
  return (
    <StatusText
      text={`Exceeding $${cashDiff.toFixed(2)} `}
      type="error"
      icon={<ErrorOutlineIcon fontSize="small" color="error" />}
      action={
        <Button
          endIcon={<ArrowForwardIcon />}
          variant="outlined"
          color="error"
          sx={{ textTransform: 'none' }}
          onClick={onCheckCOD}
        >
          Check COD
        </Button>
      }
    />
  );
}
