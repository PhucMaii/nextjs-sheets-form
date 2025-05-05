import { FIXED_TRANSACTION_STATUS } from '@/app/utils/enum';
import { Box, Typography, useMediaQuery, Button } from '@mui/material';
import { blue, grey, yellow } from '@mui/material/colors';
import React from 'react';

function FixedTransactionEvent({
  transaction,
  type,
  onOpenEditTransaction,
}: {
  transaction: any;
  type: 'fixed' | 'transaction';
  onOpenEditTransaction: (transaction: any) => void;
}) {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));

  const bgColor =
    type === 'fixed'
      ? transaction?.status === FIXED_TRANSACTION_STATUS.ACTIVE
        ? blue[50]
        : transaction?.status === FIXED_TRANSACTION_STATUS.PENDING
          ? yellow[50]
          : grey[100]
      : grey[100];

  // const color =
  //   type === 'fixed'
  //     ? transaction?.status === FIXED_TRANSACTION_STATUS.ACTIVE
  //       ? blue[800]
  //       : transaction?.status === FIXED_TRANSACTION_STATUS.PENDING
  //         ? orange[800]
  //         : grey[800]
  //     : grey[800];
  return (
    <Box
      sx={{ width: '100%', backgroundColor: bgColor, borderRadius: 1, p: 1 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={1}
      onClick={(e: any) => {
        e.stopPropagation();
        e.preventDefault();

        onOpenEditTransaction(transaction);
      }}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="body1">{transaction?.title}</Typography>
        {!lgDown && (
          <Typography variant="caption">{transaction?.recurrence}</Typography>
        )}
      </Box>
      <Typography variant="body1">
        ${transaction?.defaultSubtotal?.toFixed(2) || 0}
      </Typography>
    </Box>
  );
}

interface IProps {
  params: any;
  fixedTransactions: any[];
  transactions: any[];
  onOpenEditTransaction: (transaction: any) => void;
  onOpenAddTransaction: (defaultDate: string) => void;
}

export default function FixedTransactionDate({
  params,
  fixedTransactions,
  transactions,
  onOpenAddTransaction,
  onOpenEditTransaction,
}: IProps) {
  console.log(params);
  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="body1">{params.dayNumberText}</Typography>
        <Button
          color="primary"
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();
            onOpenAddTransaction(params.date);
          }}
          disabled={params?.isOther}
          sx={{
            backgroundColor: params?.isOther ? grey[300] : 'inherit',
            color: params?.isOther ? grey[600] : 'inherit',
            fontSize: '12px',
            textTransform: 'none',
          }}
        >
          + Event
        </Button>
      </Box>

      <Box sx={{ width: '100%' }} display="flex" gap={1} flexDirection="column">
        {/* <Button color="primary">+ Event</Button> */}
        {fixedTransactions?.length > 0 &&
          fixedTransactions.map((transaction) => (
            <FixedTransactionEvent
              key={transaction.id}
              transaction={transaction}
              type="fixed"
              onOpenEditTransaction={onOpenEditTransaction}
            />
          ))}

        {transactions?.length > 0 &&
          transactions.map((transaction) => (
            <FixedTransactionEvent
              key={transaction.id}
              transaction={transaction}
              type="transaction"
              onOpenEditTransaction={onOpenEditTransaction}
            />
          ))}
      </Box>
    </Box>
  );
}
