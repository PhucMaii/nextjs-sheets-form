import {
  Box,
  Button,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IDriver, Notification } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps {
  driver: IDriver;
  setNotification: Dispatch<SetStateAction<Notification>>;
  mutateDrivers: any;
}

export default function EditDriver({
  driver,
  setNotification,
  mutateDrivers,
}: IProps) {
  const [updatedName, setUpdatedName] = useState<string>(driver.name);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const handleEditDriver = async () => {
    try {
      setIsEditing(true);

      const response = await axios.put(`${API_URL.ADMIN}/drivers`, {
        driverId: driver.id,
        updatedName: updatedName.toUpperCase(),
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsEditing(false);
        return;
      }

      mutateDrivers();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsEditing(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: `There was an error ${error.response.data.error}`,
      });
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

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle1">Name</Typography>
            <TextField
              value={updatedName}
              onChange={(e: any) => setUpdatedName(e.target.value)}
              // label="Name"
            />
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
