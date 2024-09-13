import { Box, Button, Modal, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { BoxModal } from '../styled';
import { errorColor } from '@/theme/color';
import { grey } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';
import ErrorIcon from '@mui/icons-material/Error';
import { IDriver, Notification } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps {
  driver: IDriver;
  setNotification: Dispatch<SetStateAction<Notification>>;
  mutateDrivers: any;
}

export default function DeleteDriver({
  driver,
  setNotification,
  mutateDrivers,
}: IProps) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDeleteDriver = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${API_URL.ADMIN}/drivers?driverId=${driver.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsDeleting(false);
        return;
      }

      mutateDrivers();
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsDeleting(false);
    } catch (error: any) {
      console.log('There was an error', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        color="error"
        onClick={(e: any) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        DELETE
      </Button>
      <Modal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <BoxModal
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <ErrorIcon sx={{ color: errorColor, fontSize: 50 }} />
          <Typography variant="h6" sx={{ color: grey[600] }} fontWeight="bold">
            Are you sure to delete driver {driver.name} ?
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              loading={isDeleting}
              onClick={handleDeleteDriver}
              variant="contained"
            >
              DELETE
            </LoadingButton>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
