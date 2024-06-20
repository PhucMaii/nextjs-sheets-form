'use client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import React, { useMemo, useState } from 'react';

interface IProps {
  customersInDebt: any;
}

const rowsPerPage = 10;
export default function CustomersInDebt({ customersInDebt }: IProps) {
  const [page, setPage] = useState<number>(0);

  const sortedCustomers = useMemo(() => {
    if (!customersInDebt) {
      return null;
    }

    return Object.keys(customersInDebt)
      .filter(
        (customer: string) =>
          customersInDebt[customer][0] > 0 && customersInDebt[customer][1] > 0,
      )
      .sort(
        (customer1: string, customer2: string) =>
          customersInDebt[customer2][1] - customersInDebt[customer1][1],
      );
  }, [customersInDebt]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  return (
    <Paper elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client Id</TableCell>
            <TableCell>Client Name</TableCell>
            <TableCell>Unpaid Orders</TableCell>
            <TableCell>Total Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCustomers &&
            sortedCustomers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer: string, index: number) => {
                const [clientName, clientId] = customer.split(' __ ');
                const [unpaidOrders, unpaidAmount] = customersInDebt[customer];
                return (
                  <TableRow key={index}>
                    <TableCell>{clientId}</TableCell>
                    <TableCell>{clientName}</TableCell>
                    <TableCell>{unpaidOrders}</TableCell>
                    <TableCell>{unpaidAmount.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={sortedCustomers?.length || 0}
        rowsPerPage={10}
        page={page}
        onPageChange={handleChangePage}
      />
    </Paper>
  );
}
