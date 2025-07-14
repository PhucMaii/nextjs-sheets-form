import { UserContext } from '@/app/context/UserContextAPI';
import { USER_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { UserType } from '@/app/utils/type';
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
import React, { useContext } from 'react';
import EditAdmin from '../Modals/edit/EditAdmin';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { useParams } from 'next/navigation';

interface IProps {
  admins: UserType[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AdminTable({ admins, showNotification }: IProps) {
  const { companyId }: any = useParams();

  const { user } = useContext(UserContext);

  const onDeleteAdmin = async (admin: UserType) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `?id=${admin.id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  return (
    <Paper sx={{ overflow: 'scroll' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Contact Number</TableCell>
            {user?.role === USER_ROLE.SUPER_ADMIN && <TableCell></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {admins.length > 0 &&
            admins.map((admin: UserType) => {
              return (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.clientName}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.contactNumber}</TableCell>
                  {user?.role === USER_ROLE.SUPER_ADMIN && (
                    <TableCell>
                      <Box display="flex" flexDirection="row" gap={1}>
                        <DeleteModal
                          targetObj={admin}
                          handleDelete={(_e: any, admin: UserType) =>
                            onDeleteAdmin(admin)
                          }
                          includedButton
                          showTargetObj={`Admin - ${admin.clientName}`}
                        />
                        <EditAdmin
                          admin={admin}
                          showNotification={showNotification}
                        />
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Paper>
  );
}
