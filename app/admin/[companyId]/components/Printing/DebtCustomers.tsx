import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { forwardRef, useMemo } from 'react';

// eslint-disable-next-line react/display-name
const DebtCustomers = forwardRef(({ debtCustomers }: any, ref: any) => {
  const sortedCustomers = useMemo(() => {
    if (!debtCustomers) {
      return null;
    }

    return Object.keys(debtCustomers)
      .filter(
        (customer: string) =>
          debtCustomers[customer][0] > 0 && debtCustomers[customer][1] > 0,
      )
      .sort(
        (customer1: string, customer2: string) =>
          debtCustomers[customer2][1] - debtCustomers[customer1][1],
      );
  }, [debtCustomers]);

  return (
    <div ref={ref}>
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
            sortedCustomers.map((debtCustomer: any, index: number) => {
              const [clientName, clientId] = debtCustomer.split(' __ ');
              const [unpaidOrders, unpaidAmount] = debtCustomers[debtCustomer];
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
    </div>
  );
});

export default DebtCustomers;
DebtCustomers.displayName = 'DebtCustomers';
