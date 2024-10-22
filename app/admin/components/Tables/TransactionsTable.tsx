import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Image from 'next/image';
import React from 'react';

interface IProps {
  transactions: any[];
}

export default function TransactionsTable({ transactions }: IProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Method</TableCell>
          <TableCell>Id</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Spent By</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>When</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.length > 0 &&
          transactions.map((transaction: any, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell style={{ width: 50 }}>
                  <Image
                    src={`/${transaction.paymentMethod.type}.png`}
                    alt="method"
                    width={30}
                    height={30}
                  />
                </TableCell>
                <TableCell style={{ width: 50 }}>{transaction.id}</TableCell>
                <TableCell style={{ width: 100 }}>
                  ${transaction.amount}
                </TableCell>
                <TableCell style={{ width: 150 }}>
                  {transaction.spentBy}
                </TableCell>
                <TableCell style={{ width: 300 }}>
                  {transaction.description}
                </TableCell>
                <TableCell style={{ width: 100 }}>{transaction.date}</TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
