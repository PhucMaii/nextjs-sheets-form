import { Box, Divider, Modal, TextField, Typography } from '@mui/material';
import React, { memo, useState } from 'react';
import { BoxModal } from '../styled';
import { LoadingButton } from '@mui/lab';
import { ModalProps } from '../type';
import { blueGrey } from '@mui/material/colors';

export interface IProps extends ModalProps {
  handleUpdate: (newAnnounce: string) => Promise<void>;
}

const EditAnnouncement = ({ open, onClose, handleUpdate }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedAnnouncement, setUpdatedAnnouncement] = useState<string>('');

  const handleSavingUpdate = async () => {
    if (!handleUpdate) {
      return;
    }
    try {
      setIsLoading(true);
      await handleUpdate(updatedAnnouncement);
      onClose();
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to save update: ', error);
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" color={blueGrey[800]}>
            Edit Announcement
          </Typography>
          <LoadingButton
            variant="contained"
            loading={isLoading}
            onClick={handleSavingUpdate}
          >
            UPDATE
          </LoadingButton>
        </Box>
        <Divider />
        {/* <Typography variant="h6">{label}</Typography> */}
        <TextField
          label="Announcement"
          value={updatedAnnouncement}
          onChange={(e: any) => setUpdatedAnnouncement(e.target.value)}
          multiline
        />
      </BoxModal>
    </Modal>
  );
};

export default memo(EditAnnouncement);
