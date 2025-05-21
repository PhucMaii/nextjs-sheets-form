import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { ORDER_STATUS } from '@/app/utils/enum';

interface IProps extends ModalProps {
  heading: string;
  handleConfirm: (
    orderId: number,
    updatedStatus: ORDER_STATUS,
  ) => Promise<void>;
  color: any;
  updatedStatus: ORDER_STATUS;
  orderId: number;
}
export default function ConfirmModal({
  open,
  onClose,
  handleConfirm,
  heading,
  color,
  updatedStatus,
  orderId,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOnClick = async () => {
    setIsLoading(true);
    await handleConfirm(orderId, updatedStatus);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        gap={2}
        maxHeight="80vh"
        overflow="auto"
      >
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography textAlign="center" variant="h6">
          {heading}
        </Typography>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={6}>
            <Button
              onClick={onClose}
              fullWidth
              variant="outlined"
              color={color}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6}>
            <LoadingButton
              loading={isLoading}
              onClick={handleOnClick}
              fullWidth
              variant="contained"
              color={color}
            >
              Yes, I'm sure
            </LoadingButton>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
