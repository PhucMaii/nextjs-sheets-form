import {
  AlertColor,
  Box,
  Button,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IDriver } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps {
  driver: IDriver;
  showNotification: (type: AlertColor, message: string) => void;
  mutateDrivers: any;
}

export default function EditDriver({
  driver,
  showNotification,
  mutateDrivers,
}: IProps) {
  const [updatedName, setUpdatedName] = useState<string>(driver.name);
  const [hourlyRate, setHourlyRate] = useState<number>(driver?.hourlyRate || 0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const handleEditDriver = async () => {
    try {
      setIsEditing(true);

      const response = await axios.put(`${API_URL.ADMIN}/drivers`, {
        driverId: driver.id,
        updatedName: updatedName.toUpperCase(),
        hourlyRate
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsEditing(false);
        return;
      }

      mutateDrivers();

      showNotification('success', response.data.message);
      setIsEditing(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        `There was an error ${error.response.data.error}`,
      );
      setIsEditing(false);
    }
  };
  return (
    <>
      <Button onClick={() => setIsOpenModal(true)}>Edit</Button>
      <Modal open={isOpenModal} onClose={() => setIsOpenModal(false)}>
        <BoxModal>
          <ModalHead
            heading="Edit Driver"
            buttonLabel="Save"
            onClick={handleEditDriver}
            onClose={() => setIsOpenModal(false)}
            buttonProps={{ loading: isEditing }}
          />
          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">Name</Typography>
              <TextField
                value={updatedName}
                onChange={(e: any) => setUpdatedName(e.target.value)}
                // label="Name"
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">Hourly Rate</Typography>
              <TextField
                value={hourlyRate}
                onChange={(e: any) => setHourlyRate(+e.target.value)}
                // label="Name"
                type="number"
              />
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
