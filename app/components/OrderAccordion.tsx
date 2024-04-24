import { Accordion, AccordionSummary, Box, Grid, Typography } from '@mui/material'
import React from 'react'
import StatusText from '../admin/components/StatusText';
import Button from './Button';

export default function OrderAccordion({order}) {
  return (
    <Accordion>
        <AccordionSummary>
        <Grid container alignItems="center">
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <StatusText text='Completed' type={'success'} />
              </Box>
            </Grid>
            <Grid item xs={12} md={2} sx={{ mr: 2 }}>
              <Typography fontWeight="bold" variant="subtitle1">
                202
              </Typography>
              <Typography variant="body2">
                Order at: 
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                label={order.clientName}
                color="blue"
                // onClick={handleOpenClientModal}
                width="auto"
              />
            </Grid>
            <Grid item xs={12} md={3} textAlign="center">
              <Typography fontWeight="bold" variant="subtitle1">
                Items: 23
              </Typography>
              <Typography fontWeight="bold" variant="subtitle1">
                Total: $200.00
              </Typography>
              <Box display="flex" gap={2} alignItems="center" justifyContent="center">
                <Typography fontWeight="bold" variant="subtitle1">
                  Delivery Date: 04/30/2233
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionSummary>
      
    </Accordion>
  )
}
