import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Action } from '@prisma/client';
import React from 'react';

interface IProps {
  actionData: any[];
}

export default function TrackInventoryRecordTable({ actionData }: IProps) {
  return (
    <Paper sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actionData?.map((action: Action, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell>{action.id}</TableCell>
                <TableCell>{action.date}</TableCell>
                <TableCell>{action.description}</TableCell>
                <TableCell>{action.name}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
