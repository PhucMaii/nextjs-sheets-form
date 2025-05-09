import { AlertColor, Box, Button, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from './type';
import ErrorIcon from '@mui/icons-material/Error';
import { BoxModal } from './styled';
import { grey } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';

interface IProps extends ModalProps {
  title: string;
  handleSubmit: any;
  buttonLabel?: string;
  showNotification: (type: AlertColor, message: string) => void;
  color?: AlertColor;
}

export default function ConfirmModal({
  open,
  onClose,
  title,
  handleSubmit,
  buttonLabel,
  showNotification,
  color,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await handleSubmit();
      setIsLoading(false);
      showNotification('success', 'Action Completed Successfully');
    } catch (error: any) {
      console.log('Fail to confirm: ', error);
      setIsLoading(false);
      showNotification('error', error.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
      >
        <ErrorIcon sx={{ color: grey[600], fontSize: 50 }} />
        <Typography variant="h6" sx={{ color: grey[600] }} fontWeight="bold">
          {title}
        </Typography>

        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="outlined"
            onClick={onClose}
            color={color ? color : 'primary'}
          >
            CANCEL
          </Button>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            onClick={handleConfirm}
            color={color ? color : 'primary'}
          >
            {buttonLabel ? buttonLabel : 'CONFIRM'}
          </LoadingButton>
        </Box>
      </BoxModal>
    </Modal>
  );
}
