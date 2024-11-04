import { IExpense } from '@/app/utils/type';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

interface IProps {
  stockOrders: IExpense[];
}

export default function OrderStockTable({stockOrders}: IProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Method</TableCell>
          <TableCell>Id</TableCell>
          <TableCell>Cost</TableCell>
          <TableCell>Spent By</TableCell>
          <TableCell>Vendors</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {stockOrders && stockOrders.length > 0 &&
          stockOrders.map((expense: IExpense, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell>
                <img
                    src={`/images/${expense.paymentMethod.type}.png`}
                    alt="method"
                    style={{ width: 30, height: 30 }}
                  />
                </TableCell>
                <TableCell>{expense.id}</TableCell>
                <TableCell>${expense.amount}</TableCell>
                <TableCell>{expense.spentBy}</TableCell>
                <TableCell>{expense?.vendors?.map((vendor: any) => vendor.vendor.name).join(', ')}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.date}</TableCell>
              </TableRow>
            );
        })
      }
      </TableBody>
    </Table>
  );
}
