import { Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { rowsPerPage } from './CustomersInDebt';

export default function CustomersProfitTable({ customersProfit }: any) {
  const [page, setPage] = useState<number>(0);

  const sortedCustomers = useMemo(() => {
    if (!customersProfit) {
      return null;
    }

    return Object.keys(customersProfit).sort(
      (clientKeyA: string, clientKeyB: string) => {
        return (
          customersProfit[clientKeyB].amount -
          customersProfit[clientKeyA].amount
        );
      },
    );
  }, [customersProfit]);

  const onChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };
  
  return (
    <Paper elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client Id</TableCell>
            <TableCell>Client Name</TableCell>
            <TableCell>Profit ($)</TableCell>
            <TableCell>Profit (%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCustomers &&
            sortedCustomers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer: string, index: number) => {
                const [clientName, clientId] = customer.split(' __ ');
                const { amount, percentage } = customersProfit[customer];
                return (
                  <TableRow key={index}>
                    <TableCell>{clientId}</TableCell>
                    <TableCell>{clientName}</TableCell>
                    <TableCell>${amount.toFixed(2)}</TableCell>
                    <TableCell>{percentage.toFixed(2)}%</TableCell>
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
        onPageChange={onChangePage}
      />
    </Paper>
  );
}
