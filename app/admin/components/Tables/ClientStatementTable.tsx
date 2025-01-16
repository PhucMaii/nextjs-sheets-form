import { ClientStatementType } from '@/pages/api/admin/routes/GET';
import {
  AlertColor,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import EditClientStatement from '../Modals/edit/EditClientStatement';
import ErrorComponent from '../ErrorComponent';
import { ClientStatement } from '@prisma/client';
import ClientStatementRow from './ClientStatementRow';

interface IProps {
  routeClients: ClientStatementType[];
  showNotification: (type: AlertColor, message: string) => void;
  dateRange: Date[];
  selectedClients: ClientStatementType[];
  setSelectedClients: Dispatch<SetStateAction<ClientStatementType[]>>;
  clientStatements: ClientStatement[];
}

export default function ClientStatementsTable({
  routeClients,
  showNotification,
  dateRange,
  selectedClients,
  setSelectedClients,
  clientStatements,
}: IProps) {
  const [editClientStatementProps, setEditClientStatementProps] = useState<any>(
    {
      open: false,
      selectedClient: routeClients.length > 0 ? routeClients[0]?.client : null,
    },
  );

  const availableClients = useMemo(() => {
    return routeClients.filter(
      (client: ClientStatementType) => {
        return !clientStatements.find(
          (statement: ClientStatement) => statement.userId === client.client.id,
        )?.isPrinted;
      },
    );
  }, [routeClients]);

  // useEffect(() => {
  //   if (printClient) {
  //     setTimeout(() => {
  //       printInvoice();
  //     }, 0); // Ensure state update is processed before invoking print
  //   }
  // }, [printClient]);


  const onSelectAll = () => {
    if (selectedClients.length === availableClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(availableClients);
    }
  };

  const onSelectClient = (client: ClientStatementType) => {
    if (selectedClients.includes(client)) {
      setSelectedClients(() =>
        selectedClients.filter((selectedClient: ClientStatementType) => {
          return selectedClient.client.id !== client.client.id;
        }),
      );
    } else {
      setSelectedClients([...selectedClients, client]);
    }
  };

  return (
    <>
      {routeClients && (
        <EditClientStatement
          open={editClientStatementProps.open}
          onClose={() =>
            setEditClientStatementProps((prevState: any) => ({
              ...prevState,
              open: false,
            }))
          }
          client={editClientStatementProps.selectedClient}
          showNotification={showNotification}
          dateRange={dateRange}
        />
      )}
      <Paper elevation={0} sx={{ overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell padding="checkbox" variant="head">
                <Checkbox
                  checked={selectedClients.length === availableClients.length}
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
            {routeClients.length > 0 ? (
              routeClients.map((client: ClientStatementType, index: number) => {
                const isSelected = selectedClients.includes(client);
                const isPrintedAlready = clientStatements.find(
                  (statement: ClientStatement) =>
                    statement.userId === client.client.id,
                )?.isPrinted || false;
                return (
                  <Fragment key={index}>
                    <ClientStatementRow 
                      client={client}
                      isPrintedAlready={isPrintedAlready}
                      isSelected={isSelected}
                      onSelectClient={onSelectClient}
                      dateRange={dateRange}
                      onOpenEditModal={() => {
                        setEditClientStatementProps({
                          open: true,
                          selectedClient: client.client,
                        });
                      }}
                    />
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <ErrorComponent errorText="No clients found or select another route" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
