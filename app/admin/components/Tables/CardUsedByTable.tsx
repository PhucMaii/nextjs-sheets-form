import { Table, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

export default function CardUsedByTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Total Spend</TableCell>
          <TableCell>Transactions</TableCell>
        </TableRow>
      </TableHead>
    </Table>
  );
}
