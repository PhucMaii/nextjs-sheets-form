import StatusText from '@/app/admin/components/StatusText';
import { ShadowSection } from '@/app/admin/reports/styled';
import { Box, Button, Fab, Grid, Typography } from '@mui/material';
import React from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SellIcon from '@mui/icons-material/Sell';

export default function OrderComponent() {
  return (
    <ShadowSection>
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={8}>
          <StatusText text="Incompleted" type="warning" />
        </Grid>
        <Grid item xs={4} textAlign="right">
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
          >
            <Fab sx={{zIndex: 1}} color="primary" size="small">
              <LocalShippingIcon />
            </Fab>
            <Fab sx={{zIndex: 1}} color="success" size="small">
              <CreditScoreIcon />
            </Fab>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1">#45454</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1">
            Order at: 8:00:20 2024-06-20
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1">Delivery Date: 06/21/2024</Typography>
        </Grid>
        <Grid item textAlign="center" xs={12}>
          <Button variant="contained">Little Minh Kitchen - Monthly</Button>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" gap={1} alignItems="center">
              <SellIcon color="primary" />
              <Typography color="primary" variant="subtitle1">
                {5}
              </Typography>
            </Box>
            <Button variant="outlined">${34}</Button>
          </Box>
        </Grid>
      </Grid>
    </ShadowSection>
  );
}
