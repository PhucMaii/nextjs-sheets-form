import { UserType } from '@/app/utils/type';
import {
  AlertColor,
  Box,
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
import { API_URL, USER_CATEGORIZED } from '@/app/utils/enum';
import ApproveGuest from '../Modals/ApproveGuest';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';

interface IProps {
  guests: UserType[];
  showNotification: (type: AlertColor, message: string) => void;
}

const GuestTable = ({ guests, showNotification }: IProps) => {
  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    userId: 0,
  });
  const [approveProps, setApproveProps] = useState<any>({
    open: false,
    client: {},
  });

  const handleDeleteClient = async (client: UserType) => {
    setDeleteProps({
      open: true,
      userId: client.id,
    });
    try {
      const response = await axios.delete(
        `${API_URL.CLIENTS}?userId=${client.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
    } finally {
      setDeleteProps({
        open: false,
        userId: 0,
      });
    }
  };

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
                      <Box display="flex" alignItems="center" gap={2}>
                        <LoadingButton
                          loading={
                            deleteProps.userId === guest.id && deleteProps.open
                              ? true
                              : false
                          }
                          onClick={() => handleDeleteClient(guest)}
                          color="error"
                        >
                          Delete
                        </LoadingButton>
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
                      </Box>
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
