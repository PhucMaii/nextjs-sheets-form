import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { Box, IconButton, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { LoadingButton } from '@mui/lab';
import { AccessTime } from '@mui/icons-material';
import { IShiftSession } from '@/app/utils/type';

export enum ShiftType {
  CLOCK_IN = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
}

interface IProps extends ModalProps {
  type: ShiftType;
  shift: IShiftSession | null;
}

export default function ShiftModal({ open, onClose, type, shift }: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.DRIVER}/shift`);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!shift) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.DRIVER}/shift/clock-out`, {
        shiftId: shift?.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    if (type === ShiftType.CLOCK_IN) {
      await handleClockIn();
    } else {
      await handleClockOut();
    }
  };

  return (
    <>
      {NotificationComp}
      <Modal open={open} onClose={onClose}>
        <BoxModal
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Box display="flex" width="100%" justifyContent="flex-end">
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography textAlign="center" variant="h6" sx={{ mt: 2 }}>
            {type === ShiftType.CLOCK_IN
              ? `⏰ Are you ready to clock in yet?`
              : `💪 Thank you for your effort today!`}
          </Typography>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            fullWidth
            onClick={onSubmit}
            sx={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              alignSelf: 'center',
              mt: 2,
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={0.5}
            >
              <AccessTime fontSize="medium" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {type === ShiftType.CLOCK_IN ? 'Clock In' : 'End Shift'}
              </Typography>
            </Box>
          </LoadingButton>
        </BoxModal>
      </Modal>
    </>
  );
}
