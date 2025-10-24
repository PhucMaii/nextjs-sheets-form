import React from 'react';
import { Box, Typography } from '@mui/material';
import { Divider } from '@mui/material';

interface IProps {
  creditSummary: {
    totalQuantity: number;
    totalCreditAmount: number;
    totalLoss: number;
  };
}
export default function CreditSummary({ creditSummary }: IProps) {
  return (
    <>
      <Typography variant="subtitle1">Credit Summary</Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Typography variant="subtitle2">Number of items</Typography>
        <Typography variant="body1" fontWeight="bold">
          {creditSummary.totalQuantity || 0} items
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">Total Credit Amount</Typography>
        <Typography variant="body1" fontWeight="bold">
          ${creditSummary.totalCreditAmount?.toFixed(2)}
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">Total Loss</Typography>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ fontSize: '1.5rem' }}
          color="error"
        >
          ${creditSummary.totalLoss?.toFixed(2)}
        </Typography>
      </Box>
    </>
  );
}
