import React, { useContext, useState } from 'react';
import { ShadowSection } from '../reports/styled';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { printFontSize } from './Printing/ComponentToPrint';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import EditAnnouncement from './Modals/edit/EditAnnouncement';
import { Notification } from '@/app/utils/type';
import NotificationPopup from './Notification';
import axios from 'axios';
import { UserContext } from '@/app/context/UserContextAPI';

const orderFieldsExample: any = {
  Invoice: 1,
  'Client Id': '00107',
  'Client Name': `Little Minh's Kitchen - MONTHLY`,
  'Order Time': '11:11:11 2024-09-06',
  'Delivery Date': '09/07/2024',
};

export default function Announcement() {
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [notificaiton, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });

  // Context
  const { user } = useContext(UserContext);

  // Data Fetching
  const [announcement, mutateAnnouncement] = SWRFetchData(
    `${API_URL.ADMIN}/announcement`,
  );

  const handleUpdateAnnouncement = async (newAnnounce: string) => {
    try {
      const response = await axios.put(`${API_URL.ADMIN}/announcement`, {
        announcement: newAnnounce,
        updatedBy: `Admin - ${user.clientName}`,
        updatedAt: new Date(),
        announcementId: announcement.data.id,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      mutateAnnouncement();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to save update: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Internal Server Error: ' + error,
      });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mx={2}>
      <NotificationPopup
        notification={notificaiton}
        onClose={() => setNotification({ ...notificaiton, on: false })}
      />
      <EditAnnouncement
        open={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        handleUpdate={handleUpdateAnnouncement}
      />
      <ShadowSection sx={{ width: '500px', margin: 'auto' }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <Typography textAlign="center" variant="h4" fontWeight="bold">
            SUPREME SPROUTS LTD
          </Typography>
          <Typography textAlign="center" variant="h5">
            1-6420 Beresford Street, Burnaby, BC, V5E 1B3
          </Typography>
          <Typography variant="h5">
            778 789 1060
            <br />
            709 989 6000
          </Typography>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Grid container alignItems="center" rowGap={2} mb={2}>
          {orderFieldsExample &&
            Object.keys(orderFieldsExample).map(
              (orderField: string, index: number) => {
                return (
                  <Grid key={index} item xs={12}>
                    <Typography sx={{ fontSize: printFontSize }}>
                      <strong>{orderField}:</strong>{' '}
                      {orderFieldsExample[orderField]}
                    </Typography>
                  </Grid>
                );
              },
            )}
          <Typography sx={{ fontSize: printFontSize }} fontWeight="bold">
            Order Details:{' '}
          </Typography>
          <Table sx={{ marginLeft: '-10px' }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 'bold', fontSize: printFontSize - 5 }}
                >
                  Item
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', fontSize: printFontSize - 5 }}
                >
                  No. Items
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', fontSize: printFontSize - 5 }}
                >
                  Unit Price
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    fontSize: printFontSize - 5,
                    marginRight: 4,
                  }}
                >
                  Total Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontSize: 18, fontWeight: 'bold' }}>
                  BEAN 10 LB
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>
                  2
                </TableCell>
                <TableCell sx={{ fontSize: 18 }}>$10</TableCell>
                <TableCell sx={{ fontSize: 18 }}>$20.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontSize: 18, fontWeight: 'bold' }}>
                  BASIL
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>
                  3
                </TableCell>
                <TableCell sx={{ fontSize: 18 }}>$6.50</TableCell>
                <TableCell sx={{ fontSize: 18 }}>$19.50</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Divider sx={{ mt: 3 }} />
          <Grid container>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: printFontSize - 5 }}>
                Total:
              </Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Typography sx={{ fontSize: printFontSize - 5 }}>
                $39.50
              </Typography>
            </Grid>
          </Grid>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <Typography sx={{ fontSize: printFontSize - 5 }}>
              <strong>DELIVERY ADDRESS:</strong> 7533 Market Crossing, Burnaby,
              BC V5J 0A3
            </Typography>
            <Typography sx={{ fontSize: printFontSize - 5 }}>
              <strong>CONTACT:</strong> 17789286668
            </Typography>
          </Box>

          <Grid item xs={12}>
            <Divider sx={{ mt: 1, mb: 3 }} />
            <Typography sx={{ fontSize: printFontSize - 5 }}>
              <strong>NOTE:</strong> This is test note
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography
                textAlign="center"
                sx={{ fontSize: printFontSize - 5 }}
              >
                * {announcement?.data?.announcement} *{' '}
              </Typography>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="right"
                alignItems="center"
              >
                <IconButton onClick={() => setIsOpenEdit(true)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleUpdateAnnouncement('')}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography textAlign="right">Order by: Admin - Admin Test</Typography>
      </ShadowSection>
    </Box>
  );
}
