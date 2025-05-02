import { FIXED_TRANSACTION_STATUS } from '@/app/utils/enum';
import { Box, Typography } from '@mui/material';
import { blue, grey, orange, yellow } from '@mui/material/colors';
import React from 'react';

function FixedTransactionEvent({
  transaction,
  type,
}: {
  transaction: any;
  type: 'fixed' | 'transaction';
}) {
  const bgColor =
    type === 'fixed'
      ? transaction?.status === FIXED_TRANSACTION_STATUS.ACTIVE
        ? blue[100]
        : transaction?.status === FIXED_TRANSACTION_STATUS.PENDING
          ? yellow[100]
          : grey[100]
      : grey[100];

  const color =
    type === 'fixed'
      ? transaction?.status === FIXED_TRANSACTION_STATUS.ACTIVE
        ? blue[800]
        : transaction?.status === FIXED_TRANSACTION_STATUS.PENDING
          ? orange[800]
          : grey[800]
      : grey[800];
  return (
    <Box
      sx={{ width: '100%', backgroundColor: bgColor, borderRadius: 1, p: 1 }}
      display="flex"
      justifyContent="space-between"
      gap={1}
    >
      <Typography variant="body1" color={color}>{transaction?.title}</Typography>
      <Typography variant="body1" color={color}>
        ${transaction?.defaultSubtotal?.toFixed(2) || 0}
      </Typography>
    </Box>
  );
}

interface IProps {
  params: any;
  fixedTransactions: any[];
  transactions: any[];
}

export default function FixedTransactionDate({
  params,
  fixedTransactions,
  transactions,
}: IProps) {
  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="body1" textAlign="right">
        {params.dayNumberText}
      </Typography>

      <Box sx={{ width: '100%' }} display="flex" gap={1} flexDirection="column">
        {/* <Button color="primary">+ Event</Button> */}
        {fixedTransactions?.length > 0 &&
          fixedTransactions.map((transaction) => (
            <FixedTransactionEvent
              key={transaction.id}
              transaction={transaction}
              type="fixed"
            />
          ))}

        {transactions?.length > 0 &&
          transactions.map((transaction) => (
            <FixedTransactionEvent
              key={transaction.id}
              transaction={transaction}
              type="transaction"
            />
          ))}
      </Box>
    </Box>
  );
}
