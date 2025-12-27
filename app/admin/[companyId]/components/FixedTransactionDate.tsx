import { warning } from '@/theme/color';
import { Box, Typography, useMediaQuery, Button, Chip } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import React from 'react';

function FixedTransactionEvent({
  transaction,
  onOpenEditTransaction,
  isGrey,
}: {
  transaction: any;
  onOpenEditTransaction: (transaction: any) => void;
  isGrey?: boolean;
}) {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));
  const backgroundColor = isGrey ? grey[100] : transaction?.hasStopped ? warning[100] : blue[100];

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: backgroundColor,
        borderRadius: 1,
        p: 1,
      }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={1}
      onClick={(e: any) => {
        e.stopPropagation();
        e.preventDefault();

        if (isGrey) {
          return;
        }

        onOpenEditTransaction(transaction);
      }}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography
          color={isGrey ? grey[600] : 'black'}
          fontWeight="semibold"
          variant="body1"
        >
          {transaction?.title}
        </Typography>
        {!lgDown && (
          <Typography color={isGrey ? grey[600] : 'black'} variant="caption">
            {transaction?.recurrence}
          </Typography>
        )}
      </Box>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Typography color={isGrey ? grey[600] : 'black'} variant="body1">
          ${transaction?.defaultAmount?.toFixed(2) || 0}
        </Typography>
        {transaction?.type && <Chip label={transaction?.type?.name} size="small" color="primary" variant="outlined" />}
      </Box>
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
  // console.log({transactions});
  return (
    <Box sx={{ px: 2, py: 1 }} display="flex" flexDirection="column" gap={1}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="body1">{params.dayNumberText}</Typography>
        <Button
          color="primary"
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();
            onOpenAddTransaction(params.date);
          }}
          disabled={params?.isOther || params?.isPast}
          sx={{
            backgroundColor:
              params?.isOther || params?.isPast ? grey[300] : 'inherit',
            color: params?.isOther || params?.isPast ? grey[600] : 'inherit',
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
              onOpenEditTransaction={onOpenEditTransaction}
              isGrey={transaction?.isGrey}
            />
          ))}
      </Box>

      <Box sx={{ width: '100%' }} display="flex" gap={1} flexDirection="column">
        {transactions?.length > 0 &&
          transactions.map((transaction) => (
            <FixedTransactionEvent
              key={transaction.id}
              transaction={transaction}
              onOpenEditTransaction={onOpenEditTransaction}
              isGrey
            />
          ))}
      </Box>
    </Box>
  );
}
