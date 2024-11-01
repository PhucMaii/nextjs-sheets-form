import {
  AlertColor,
  Box,
  Button,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IVendor } from '@/app/utils/type';
import AutoCompleteAddress from '../../AutoCompleteAddress';
import useSelectDate from '@/hooks/useSelectDate';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps {
  vendor: IVendor;
  showNotification: (type: AlertColor, message: string) => void;
}

const EditVendor = ({ vendor, showNotification }: IProps) => {
  const [address, setAddress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [updatedVendor, setUpdatedVendor] = useState<IVendor>(vendor);

  const { date, setDate, SelectDate } = useSelectDate(vendor?.joinedDate, true);

  useEffect(() => {
    if (vendor) {
      setUpdatedVendor(vendor);
      setAddress(vendor.address);
      setDate(vendor.joinedDate);
    }
  }, [vendor]);

  const handleEditVendor = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/vendors`, {
        id: vendor.id,
        name: updatedVendor.name,
        phoneNumber: updatedVendor.phoneNumber,
        address: address ? address : vendor.address,
        joinedDate: date,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
      setOpen(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Internal Server Error: ' + error.response.data.error,
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <BoxModal>
          <ModalHead
            heading="Edit Vendor"
            buttonLabel="EDIT"
            onClick={handleEditVendor}
            buttonProps={{ loading: isLoading }}
            onClose={() => setOpen(false)}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={3}>
            {/* Name */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Name</Typography>
              <TextField
                fullWidth
                placeholder="Enter vendor's name..."
                value={updatedVendor.name}
                onChange={(e) =>
                  setUpdatedVendor({ ...updatedVendor, name: e.target.value })
                }
              />
            </Box>

            {/* Phone Number */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Contact</Typography>
              <TextField
                fullWidth
                placeholder="Enter vendor's phone number..."
                value={updatedVendor.phoneNumber}
                onChange={(e) =>
                  setUpdatedVendor({
                    ...updatedVendor,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </Box>

            {/* Address */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Address</Typography>
              <AutoCompleteAddress
                onDataReceived={(data) => setAddress(data?.description)}
                initialValue={vendor.address}
              />
            </Box>

            {/* Joined Date */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Joined Date</Typography>
              {SelectDate}
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(EditVendor, (prev, next) => {
  return JSON.stringify(prev) === JSON.stringify(next);
});
