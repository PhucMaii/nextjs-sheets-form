import { Divider, Grid, Modal, Typography } from '@mui/material';
import React from 'react';
import { BoxModal } from './styled';

interface PropTypes {
  open: boolean;
  onClose: () => void;
  deliveryAddress: string;
  contactNumber: string;
  categoryName: string;
}

export default function ClientDetailsModal({
  open,
  onClose,
  deliveryAddress,
  contactNumber,
  categoryName,
}: PropTypes) {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h6">Delivery Address</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="h6">{deliveryAddress}</Typography>
          </Grid>
        </Grid>
        <Divider />
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h6">Contact</Typography>
          </Grid>
          <Grid item textAlign="right" xs={6}>
            <Typography variant="h6">{contactNumber}</Typography>
          </Grid>
        </Grid>
        <Divider />
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h6">Category</Typography>
          </Grid>
          <Grid item textAlign="right" xs={6}>
            <Typography variant="h6">{categoryName}</Typography>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
