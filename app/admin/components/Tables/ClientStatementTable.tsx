import { ClientStatementType } from '@/pages/api/admin/routes/GET';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

export default function ClientStatementsTable({
  routeClients,
}: {
  routeClients: ClientStatementType[];
}) {
  return (
    <Paper elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Client Id</TableCell>
            <TableCell>Orders</TableCell> {/* Number of orders */}
            <TableCell>Total</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routeClients.length > 0 &&
            routeClients.map((client: ClientStatementType, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>{client.client.clientName}</TableCell>
                  <TableCell>{client.client.clientId}</TableCell>
                  <TableCell>{client.orders.length}</TableCell>{' '}
                  {/* Number of orders */}
                  <TableCell>
                    $
                    {client.orders.reduce(
                      (total, order) => total + order.totalPrice,
                      0,
                    )}
                  </TableCell>
                  <TableCell>
                    <Button>Edit</Button>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Paper>
  );
}
