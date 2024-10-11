import { Box, Button, Divider, Grid, Typography } from '@mui/material'
import React from 'react'
import { ShadowSection } from '../reports/styled';
import RememberMeIcon from '@mui/icons-material/RememberMe';
import StatusText from './StatusText';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { grey } from '@mui/material/colors';


export default function CODBoardSummary() {

  return (
    <ShadowSection display="flex" flexDirection="column" gap={1} p={2}>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={0.5}>
          <RememberMeIcon fontSize="small" color="primary" />
          <Typography variant="body2">Bin Mai</Typography>
        </Box>
        <StatusText text="Cleared" type="success" icon={<CheckIcon fontSize='small' color='success' />} />
      </Box>

      <Grid container alignItems="stretch">
        <Grid item xs={12} md={8.9}>
          <Box>
            <Typography variant="h6">NGUYEN</Typography>
            <Typography variant="body2" color={grey[500]}>Delivered on: 10/10/2024</Typography>
          </Box>
          <Divider sx={{my: 2}}/>
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2} flexWrap={'wrap'}>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">3</Typography>
              <Typography variant="body2" color={grey[600]} textAlign="center">Total Orders</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">$100</Typography>
              <Typography variant="body2" color={grey[600]}>Uncollected Amount</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">$200</Typography>
              <Typography variant="body2" color={grey[600]}>Collected Amount</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">3</Typography>
              <Typography variant="body2" color={grey[600]}>Clients</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={0.1}>
          <Divider orientation="vertical" flexItem sx={{height: '100%'}} />
        </Grid>

        <Grid item xs={12} md={3} textAlign="center">
          <Box display="flex" flexDirection="column" gap={0.5} justifyContent="center" mb={2}>
            <Typography variant="h4" textAlign="center">5</Typography>
            <Typography variant="body2" color={grey[600]}>Uncleared Orders</Typography>
          </Box>
          <Button variant="contained">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="subtitle2">View details</Typography>
              <ArrowForwardIosIcon fontSize="small" />
            </Box>
          </Button>
        </Grid>
      </Grid>
    </ShadowSection>
  )
}
