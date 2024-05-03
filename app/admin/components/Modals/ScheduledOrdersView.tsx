import React from 'react';
import { ModalProps } from './type';
import { Box, Divider, Grid, Modal, Typography } from '@mui/material';
import { BoxModal } from './styled';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';
import { infoColor } from '@/app/theme/color';

interface PropTypes extends ModalProps {}

export default function ScheduledOrdersView({ open, onClose }: PropTypes) {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Edit Scheduled Order</Typography>
          <LoadingButtonStyles
            variant="contained"
            // loading={isAdding}
            // onClick={handleAddClient}
            color={infoColor}
          >
            SAVE
          </LoadingButtonStyles>
        </Box>
        <Divider />
        <Grid container>
            <Grid item xs={12} md={6}>
                
            </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
