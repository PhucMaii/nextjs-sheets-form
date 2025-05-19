import { IVendor } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import EditVendor from '../Modals/edit/EditVendor';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps {
  vendors: IVendor[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function VendorTable({ vendors, showNotification }: IProps) {
  const { companyId }: any = useParams();

  const handleDelete = async (targetObj: IVendor) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/vendors?id=${targetObj.id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
    }
  };

  return (
    <Paper sx={{ overflow: 'scroll' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Joined Date</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vendors.length > 0 &&
            vendors.map((vendor: IVendor, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>{vendor.id}</TableCell>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>{vendor?.email}</TableCell>
                  <TableCell>{vendor.phoneNumber}</TableCell>
                  <TableCell>{vendor.address}</TableCell>
                  <TableCell>{vendor.joinedDate}</TableCell>
                  <TableCell>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                    >
                      <DeleteModal
                        targetObj={vendor}
                        includedButton
                        handleDelete={handleDelete}
                      />
                      <EditVendor
                        vendor={vendor}
                        showNotification={showNotification}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Paper>
  );
}
