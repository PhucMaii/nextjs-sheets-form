import { AlertColor, Box, Divider, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import AutoCompleteAddress from '../../AutoCompleteAddress';
import useSelectDate from '@/hooks/useSelectDate';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void
}

export default function AddVendor({open, onClose, showNotification}: IProps) {
  const [address, setAddress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newVendor, setNewVendor] = useState<any>({
    name: '',
    phoneNumber: '',
  });

  const today = YYYYMMDDFormat(new Date());
  const { date, SelectDate, setDate } = useSelectDate(today, true);

  const handleAddVendor = async () => {
    setIsLoading(true);
    try {
      const createdAt = generateCurrentTime();

      const response = await axios.post(`${API_URL.ADMIN}/vendors`, {
        name: newVendor.name,
        phoneNumber: newVendor.phoneNumber,
        address: address?.description,
        joinedDate: date,
        createdAt,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      resetState();

      setIsLoading(false);

    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong');
      setIsLoading(false);
      return;
    }
  }

  const resetState = () => {
    setNewVendor({
      name: '',
      phoneNumber: '',
    });

    setAddress(null);
    setDate(today);
  }

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading="Add Vendor"
                buttonLabel="ADD"
                onClose={onClose}
                buttonProps={{loading: isLoading}}
                onClick={handleAddVendor}
            />

            <Divider sx={{ my: 2 }} />

            <Box display="flex" flexDirection="column" gap={3}>
              {/* Name */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h6">Name</Typography>
                <TextField 
                  fullWidth
                  placeholder="Enter vendor's name..."
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                />
              </Box>

              {/* Phone Number */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h6">Contact</Typography>
                <TextField 
                  fullWidth
                  placeholder="Enter vendor's phone number..."
                  value={newVendor.phoneNumber}
                  onChange={(e) => setNewVendor({ ...newVendor, phoneNumber: e.target.value })}
                />
              </Box>

              {/* Address */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h6">Address</Typography>
                <AutoCompleteAddress onDataReceived={(data) => setAddress(data)}/>
              </Box>

              {/* Joined Date */}              
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h6">Joined Date</Typography>
                {SelectDate}
              </Box>
            </Box>
        </BoxModal>
    </Modal>
  )
}
