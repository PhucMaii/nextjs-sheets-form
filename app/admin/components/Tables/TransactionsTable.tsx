import { Table, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

export default function TransactionsTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Method</TableCell>
          <TableCell>Id</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Spent By</TableCell>
          <TableCell>When</TableCell>
          <TableCell>Note</TableCell>
        </TableRow>
      </TableHead>
    </Table>
  );
}
