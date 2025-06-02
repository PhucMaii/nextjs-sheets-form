import { UserType } from '@/app/utils/type';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { forwardRef } from 'react';

interface IProps {
  clients: UserType[];
}

const ClientListPrint = forwardRef(({ clients }: IProps, ref: any) => {
  return (
    <div ref={ref}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Payment Type</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Client Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Contact #</TableCell>
            <TableCell>Address</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.length > 0 &&
            clients.map((client: UserType) => {
              return (
                <TableRow key={client.id}>
                  <TableCell>{client.preference?.paymentType}</TableCell>
                  <TableCell>{client.type}</TableCell>
                  <TableCell>{client.clientId}</TableCell>
                  <TableCell>{client.clientName}</TableCell>
                  <TableCell>{client.category.name}</TableCell>
                  <TableCell>{client.contactNumber}</TableCell>
                  <TableCell>{client.deliveryAddress}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
});

ClientListPrint.displayName = 'ClientListPrint';
export default ClientListPrint;
