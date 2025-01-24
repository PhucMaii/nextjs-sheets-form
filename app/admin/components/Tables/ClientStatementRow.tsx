import React, { Dispatch, SetStateAction, useRef } from 'react';
import { InvoicePrint } from '../Printing/InvoicePrint';
import {
  Box,
  Button,
  Checkbox,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import StatusText from '../StatusText';
import { useReactToPrint } from 'react-to-print';
import { blue, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import { ClientStatementType } from '@/pages/api/admin/routes/GET';

interface IProps {
  client: ClientStatementType;
  isPrintedAlready: boolean;
  isSelected: boolean;
  onSelectClient: (client: ClientStatementType) => void;
  dateRange: Date[];
  onOpenEditModal: Dispatch<SetStateAction<any>>;
}

export default function ClientStatementRow({
  client,
  isPrintedAlready,
  isSelected,
  onSelectClient,
  dateRange,
  onOpenEditModal,
}: IProps) {
  const invoicePrint: any = useRef(null);

  const printInvoice = useReactToPrint({
    content: () => invoicePrint.current,
  });

  return (
    <>
      <div style={{ display: 'none' }}>
        <InvoicePrint
          client={client.client}
          orders={client.orders}
          ref={invoicePrint}
          endDate={dateRange[1]}
        />
      </div>

      <TableRow
        sx={{
          backgroundColor: isPrintedAlready
            ? grey[100]
            : isSelected
              ? blue[50]
              : '',
        }}
      >
        <TableCell>
          {client.incompletedOrders.length === 0 &&
            client.deliveredOrders.length === 0 &&
            client.completedOrders.length > 0 &&
            client.orders.length > 0 && (
              <StatusText text="Paid" type="success" icon={<CheckIcon />} />
            )}
        </TableCell>
        <TableCell padding="checkbox" variant="body">
          <Checkbox
            checked={isSelected}
            onClick={() => onSelectClient(client)}
            disabled={isPrintedAlready}
          />
        </TableCell>
        <TableCell>
          <Typography>{client.client.clientName}</Typography>
        </TableCell>
        <TableCell>
          <Typography>{client.client.clientId}</Typography>
        </TableCell>
        <TableCell>
          <Box display="flex" flexDirection="column" gap={1}>
            <StatusText
              text={`Incompleted: ${client?.incompletedOrders?.length}`}
              type="warning"
            />
            <StatusText
              text={`Delivered: ${client?.deliveredOrders?.length}`}
              type="info"
            />
            <StatusText
              text={`Completed: ${client?.completedOrders?.length}`}
              type="success"
            />
            <StatusText
              text={`Void: ${client?.voidOrders?.length}`}
              type="error"
            />
          </Box>
        </TableCell>
        <TableCell>
          <Typography>${client.balance?.toFixed(2)}</Typography>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1} alignItems="center">
            <Button onClick={printInvoice}>Print</Button>
            <Button
              onClick={() =>
                onOpenEditModal({
                  open: true,
                  selectedClient: client.client,
                })
              }
            >
              Edit
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}
