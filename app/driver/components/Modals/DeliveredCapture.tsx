import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { Box, Divider, IconButton, Modal, Typography } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { blueGrey } from '@mui/material/colors';

interface IProps extends ModalProps {

}

export default function DeliveredCapture({open, onClose}: IProps) {
  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <Box display="flex" alignItems='center' justifyContent='space-between'>
                <Typography variant="h6">Capture Delivery</Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Divider sx={{my: 2}} />

            <Box display="flex" flexDirection="column" justifyContent='center' alignItems="center" gap={2} p={2} borderRadius={2} sx={{ backgroundColor: blueGrey[50] }}>
                <CameraAltIcon color="primary" />
                <Typography variant="h6">Take Photo</Typography>
            </Box>

        </BoxModal>
    </Modal>
  )
}
