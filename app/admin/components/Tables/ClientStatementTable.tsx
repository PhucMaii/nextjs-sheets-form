import { ClientStatementType } from '@/pages/api/admin/routes/GET';
import {
  AlertColor,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import EditClientStatement from '../Modals/edit/EditClientStatement';

interface IProps {
  routeClients: ClientStatementType[];
  showNotification: (type: AlertColor, message: string) => void;
  dateRange: Date[]
}

export default function ClientStatementsTable({
  routeClients,
  showNotification,
  dateRange,
}: IProps) {
  const [editClientStatementProps, setEditClientStatementProps] = useState<any>({
    open: false,
    selectedClient: routeClients[0]?.client
  })

  return (
    <>
{ routeClients &&      <EditClientStatement 
        open={editClientStatementProps.open}
        onClose={() => setEditClientStatementProps((prevState: any) => ({...prevState, open: false}))}
        client={editClientStatementProps.selectedClient}
        showNotification={showNotification}
        dateRange={dateRange}
      />}
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
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => setEditClientStatementProps({open: true, selectedClient: client.client})}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
