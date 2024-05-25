'use client';
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from './styled';
import ErrorIcon from '@mui/icons-material/Error';
import { errorColor } from '@/app/theme/color';
import { grey } from '@mui/material/colors';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';
import { DELETE_OPTION } from '@/pages/api/admin/scheduledOrders/DELETE';
import { LoadingButton } from '@mui/lab';

interface PropTypes {
  targetObj: any;
  handleDelete: (
    deletedOrder: any,
    deleteOption: DELETE_OPTION,
  ) => Promise<void>;
}

export default function DeleteScheduleOrder({
  targetObj,
  handleDelete,
}: PropTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteOrder = async (deleteOption: DELETE_OPTION) => {
    try {
      setIsDeleting(true);
      await handleDelete(targetObj, deleteOption);
      setIsDeleting(false);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
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
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <ErrorIcon sx={{ color: errorColor, fontSize: 50 }} />
          <Typography variant="h6" sx={{ color: grey[600] }} fontWeight="bold">
            Are you sure to delete ?
          </Typography>
          <Box display="flex" gap={2}>
            <LoadingButton
              variant="outlined"
              color='error'
              loading={isDeleting}
              onClick={() => handleDeleteOrder(DELETE_OPTION.PERMANENT)}
            >
              DELETE
            </LoadingButton>
            <LoadingButtonStyles
              color={errorColor}
              loading={isDeleting}
              onClick={() => handleDeleteOrder(DELETE_OPTION.TEMPORARY)}
              variant="contained"
            >
              REMOVE FROM ROUTE
            </LoadingButtonStyles>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
