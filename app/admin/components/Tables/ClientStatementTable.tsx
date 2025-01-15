import { ClientStatementType } from '@/pages/api/admin/routes/GET';
import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import EditClientStatement from '../Modals/edit/EditClientStatement';
import StatusText from '../StatusText';
import ErrorComponent from '../ErrorComponent';
import { blue, grey } from '@mui/material/colors';
import { ClientStatement } from '@prisma/client';
import { InvoicePrint } from '../Printing/InvoicePrint';
import { useReactToPrint } from 'react-to-print';

interface IProps {
  routeClients: ClientStatementType[];
  showNotification: (type: AlertColor, message: string) => void;
  dateRange: Date[];
  selectedClients: ClientStatementType[];
  setSelectedClients: Dispatch<SetStateAction<ClientStatementType[]>>
  clientStatements: ClientStatement[];
}

export default function ClientStatementsTable({
  routeClients,
  showNotification,
  dateRange,
  selectedClients,
  setSelectedClients,
  clientStatements
}: IProps) {
  const [editClientStatementProps, setEditClientStatementProps] = useState<any>({
    open: false,
    selectedClient: routeClients.length > 0 ? routeClients[0]?.client : null
  });
  const [printClient, setPrintClient] = useState<ClientStatementType | null>(null);
  
  const invoicePrint: any = useRef();

  useEffect(() => {
    if (printClient) {
      printInvoice();
    }
  }, [printClient]);

  const printInvoice = useReactToPrint({
    content: () => invoicePrint.current,
  });

  const handlePrintInvoice = (client: ClientStatementType) => {
    setPrintClient(() => client);
  }


  const onSelectAll = () => {
    const availableClients = routeClients.filter((client: ClientStatementType) => {
      return !clientStatements.find((statement: ClientStatement) => statement.userId === client.client.id)?.isPrinted
    });
    if (selectedClients.length === availableClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(availableClients);
    }
  }

  const onSelectClient = (client: ClientStatementType) => {
    if (selectedClients.includes(client)) {
      setSelectedClients(() => selectedClients.filter((selectedClient: ClientStatementType) => {
        return selectedClient.client.id !== client.client.id;
      }));
    } else {
      setSelectedClients([...selectedClients, client]);
    }
  }

  return (
    <>
    {printClient &&
      <div style={{display: 'none'}}>
        <InvoicePrint 
         client={printClient.client}
         orders={printClient.orders}
         ref={invoicePrint}
         endDate={dateRange[1]}
       />
      </div>
    }
    {routeClients && <EditClientStatement 
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
              <TableCell padding="checkbox" variant="head">
                <Checkbox
                  checked={selectedClients.length === routeClients.length}
                  onClick={onSelectAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Client Id</TableCell>
              <TableCell>Orders</TableCell> {/* Number of orders */}
              <TableCell>Balance</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routeClients.length > 0 ?
              routeClients.map((client: ClientStatementType, index: number) => {
                const isSelected = selectedClients.includes(client);
                const isPrintedAlready = clientStatements.find((statement: ClientStatement) => statement.userId === client.client.id)?.isPrinted;
                return (
                  <TableRow key={index} sx={{backgroundColor: isPrintedAlready ? grey[100] : isSelected ? blue[50] : ''}}>
                    <TableCell padding="checkbox" variant="body">
                      <Checkbox
                        checked={isSelected}
                        onClick={() => onSelectClient(client)}
                        disabled={isPrintedAlready}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {client.client.clientName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {client.client.clientId}
                      </Typography>
                      </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <StatusText text={`Incompleted: ${client?.incompletedOrders?.length}`} type="warning" />
                        <StatusText text={`Delivered: ${client?.deliveredOrders?.length}`} type="info" />
                        <StatusText text={`Completed: ${client?.completedOrders?.length}`} type="success" />
                        <StatusText text={`Void: ${client?.voidOrders?.length}`} type="error" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        ${client.balance?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center">
                        <Button onClick={() => handlePrintInvoice(client)}>
                          Print
                        </Button>
                        <Button onClick={() => setEditClientStatementProps({open: true, selectedClient: client.client})}>
                          Edit
                        </Button>

                      </Box>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <ErrorComponent errorText='No clients found' />
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
