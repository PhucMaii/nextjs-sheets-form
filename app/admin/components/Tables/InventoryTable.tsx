import { IInventoryItem } from '@/app/utils/type';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

interface IProps {
  inventoryItems: IInventoryItem[];
}

export default function InventoryTable({ inventoryItems }: IProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Vendor</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Unit Value</TableCell>
          <TableCell>Total Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {inventoryItems.map((item: IInventoryItem, index: number) => {
          return (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.vendor.name}</TableCell>
              <TableCell>{item.quantity} {item.unit}</TableCell>
              <TableCell>${item.unitPrice}</TableCell>
              <TableCell>${item.totalValue}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
