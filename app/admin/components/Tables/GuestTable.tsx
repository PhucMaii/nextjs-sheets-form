import { UserType } from '@/app/utils/type';
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
import React, { memo, useState } from 'react';
import StatusText from '../StatusText';
import { USER_CATEGORIZED } from '@/app/utils/enum';
import ApproveGuest from '../Modals/ApproveGuest';

interface IProps {
  guests: UserType[];
  showNotification: (type: AlertColor, message: string) => void;
}

const GuestTable = ({ guests, showNotification }: IProps) => {
  const [approveProps, setApproveProps] = useState<any>({
    open: false,
    client: {},
  });

  return (
    <>
      <ApproveGuest
        open={approveProps.open}
        onClose={() => setApproveProps({ open: false, client: {} })}
        client={approveProps.client}
        showNotification={showNotification}
      />
      <Paper elevation={0} sx={{ overflow: 'scroll' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Temp. Client Id</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Main Contact Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Address</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guests.length > 0 &&
              guests.map((guest: UserType) => {
                return (
                  <TableRow key={guest.id}>
                    <TableCell>{guest.clientId}</TableCell>
                    <TableCell>{guest.clientName}</TableCell>
                    <TableCell>{guest?.contactName || ''}</TableCell>
                    <TableCell>
                      <StatusText
                        text={guest?.type}
                        type={
                          guest?.type === USER_CATEGORIZED.GUEST
                            ? 'info'
                            : guest?.type === USER_CATEGORIZED.PENDING
                              ? 'error'
                              : ''
                        }
                      />
                    </TableCell>
                    <TableCell>{guest.email}</TableCell>
                    <TableCell>{guest.contactNumber}</TableCell>
                    <TableCell>{guest.deliveryAddress}</TableCell>
                    <TableCell>
                      {guest?.type === USER_CATEGORIZED.PENDING && (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() =>
                            setApproveProps({ open: true, client: guest })
                          }
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default memo(GuestTable, (prev, next) => {
  return Object.is(prev.guests, next.guests);
});
