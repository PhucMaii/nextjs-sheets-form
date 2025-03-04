import {
  AlertColor,
  Box,
  Button,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { UserType } from '@/app/utils/type';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import axios from 'axios';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  admin: UserType;
}

export default function EditAdmin({ showNotification, admin }: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<any>(admin);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (admin) {
      setAdminData(admin);
    }
  }, [admin]);

  const onUpdateAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(API_URL.ADMIN, {
        id: adminData.id,
        updatedAdmin: adminData,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error || error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <ModalHead
            heading="Edit Admin"
            buttonLabel="EDIT"
            onClick={onUpdateAdmin}
            buttonProps={{
              loading: isLoading,
            }}
            onClose={() => setOpen(false)}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Name</Typography>
              <TextField
                placeholder="Enter admin name..."
                value={adminData.clientName || ''}
                onChange={(e: any) =>
                  setAdminData({ ...adminData, clientName: e.target.value })
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Role</Typography>
              <Select
                size="small"
                value={adminData.role}
                onChange={(e) =>
                  setAdminData({ ...adminData, role: e.target.value })
                }
                fullWidth
              >
                {/* <MenuItem value={USER_ROLE.CLIENT}>Client</MenuItem> */}
                <MenuItem value={USER_ROLE.ADMIN}>admin</MenuItem>
                <MenuItem value={USER_ROLE.SUPER_ADMIN}>super admin</MenuItem>
              </Select>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Email</Typography>
              <TextField
                placeholder="Enter admin email..."
                value={adminData.email || ''}
                onChange={(e: any) =>
                  setAdminData({ ...adminData, email: e.target.value })
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Contact Number</Typography>
              <TextField
                placeholder="Enter admin contact number..."
                value={adminData.contactNumber || ''}
                onChange={(e: any) =>
                  setAdminData({ ...adminData, contactNumber: e.target.value })
                }
              />
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
