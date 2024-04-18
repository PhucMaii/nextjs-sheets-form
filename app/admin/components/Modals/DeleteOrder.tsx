'use client';
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from './styled';
import ErrorIcon from '@mui/icons-material/Error';
import { errorColor } from '@/app/theme/color';
import { Order } from '../../orders/page';
import { grey } from '@mui/material/colors';

interface PropTypes {
    order: Order;
}

export default function DeleteOrder({order}: PropTypes) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
        <Button color="error" onClick={() => setIsOpen(true)}>
            DELETE
        </Button>
        <Modal open={isOpen}>
            <BoxModal
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                gap={2}
            >
                <ErrorIcon sx={{color: errorColor, fontSize: 50}} />
                <Typography variant="h6" sx={{color: grey[600]}} fontWeight="bold">
                    Are you sure to delete order {order.id} ?
                    </Typography>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" color="error" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error">DELETE</Button>
                </Box>
            </BoxModal>
        </Modal>
    </>
  )
}
