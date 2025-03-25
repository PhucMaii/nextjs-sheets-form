import { IOption } from '@/app/utils/type';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

interface IProps {
  options: IOption[];
}

export default function OptionsTable({ options }: IProps) {
  return (
    <Paper elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {options.map((option: IOption, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell>{option.name}</TableCell>
                <TableCell>${option.price.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
