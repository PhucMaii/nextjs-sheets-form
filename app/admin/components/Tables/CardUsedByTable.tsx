import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

interface IProps {
  data: any;
}

export default function CardUsedByTable({data}: IProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Total Spend</TableCell>
          <TableCell>Transactions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          Object.keys(data).length > 0 && Object.keys(data).map((spentBy: string, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell>{spentBy}</TableCell>
                <TableCell>${data[spentBy].amount}</TableCell>
                <TableCell>{data[spentBy].count}</TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  );
}
