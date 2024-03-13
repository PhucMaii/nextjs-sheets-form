import { Divider, Grid, Modal, Typography } from '@mui/material';
import React from 'react';
import { BoxModal } from './styled';

interface PropTypes {
    open: boolean;
    onClose: () => void;
}

export default function ClientDetailsModal({
    open,
    onClose
}: PropTypes) {
  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal display="flex" flexDirection="column" gap={2}>
            <Grid container alignItems="center">
                <Grid item xs={6}>
                    <Typography variant="h6">Delivery Address</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography variant="h6">7533 Market Crossing, Burnaby, BC, V3M 2E1</Typography>
                </Grid>
            </Grid>
            <Divider />
            <Grid container alignItems="center">
                <Grid item xs={6}>
                    <Typography variant="h6">Contact</Typography>
                </Grid>
                <Grid item textAlign="right" xs={6}>
                    <Typography variant="h6">11111111</Typography>
                </Grid>
            </Grid>
            <Divider />
            <Grid container alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="h6">Category</Typography>
                </Grid>
                <Grid item textAlign="right" xs={6}>
                    <Typography variant="h6">Restaurant</Typography>
                </Grid>
            </Grid>
        </BoxModal>
    </Modal>
  )
}
