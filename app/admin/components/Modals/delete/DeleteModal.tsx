'use client';
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ErrorIcon from '@mui/icons-material/Error';
import { errorColor } from '@/app/theme/color';
import { grey } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';

interface PropTypes {
  targetObj: any;
  handleDelete: (deletedOrder: any) => Promise<void>;
  includedButton?: boolean;
  open?: boolean;
  handleCloseModal?: () => void;
}

export default function DeleteModal({
  targetObj,
  handleDelete,
  includedButton,
  open,
  handleCloseModal,
}: PropTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      await handleDelete(targetObj);
      setIsDeleting(false);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      setIsDeleting(false);
    }
  };
  return (
    <>
      {includedButton && (
        <Button
          color="error"
          onClick={(e: any) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          DELETE
        </Button>
      )}
      <Modal
        open={open || isOpen}
        onClose={() => {
          if (handleCloseModal) {
            handleCloseModal();
          } else {
            setIsOpen(false);
          }
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
            Are you sure to delete ?
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (handleCloseModal) {
                  handleCloseModal();
                } else {
                  setIsOpen(false);
                }
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              loading={isDeleting}
              onClick={handleDeleteOrder}
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
