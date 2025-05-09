import React, { useState } from 'react';
import { ModalProps } from './type';
import { Box, Button, Modal, Typography } from '@mui/material';
import { BoxModal } from './styled';
import { LoadingButton } from '@mui/lab';

interface IProps extends ModalProps {
  clientName: string;
  startDate: Date;
  endDate: Date;
  handleContinueOrder: any;
}

export default function OrderOnVacationModal({
  open,
  onClose,
  clientName,
  startDate,
  endDate,
  handleContinueOrder,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: any) => {
    setIsLoading(true);
    await handleContinueOrder(e);
    setIsLoading(false);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap={2}
        maxHeight="80vh"
        overflow="auto"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <Typography variant="subtitle1" textAlign="center">
            Client {clientName} has request time off from{' '}
            {startDate.toDateString()} to {endDate.toDateString()}
          </Typography>
          <Typography variant="h6" textAlign="center">
            Are you sure to continue ordering for {clientName} ?
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" width="100%" gap={1}>
          <LoadingButton
            loading={isLoading}
            fullWidth
            variant="outlined"
            onClick={handleSubmit}
          >
            Continue
          </LoadingButton>
          <Button fullWidth variant="contained" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </BoxModal>
    </Modal>
  );
}
