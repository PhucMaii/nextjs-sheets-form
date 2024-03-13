'use client';
import React, { useState } from 'react';
import { 
    Accordion, 
    AccordionDetails, 
    AccordionSummary, 
    Box, 
    Divider, 
    Grid, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Typography 
} from '@mui/material';
import Button from '@/app/components/Button';
import { grey } from '@mui/material/colors';
import ClientDetailsModal from '../Modals/ClientDetailsModal';

export default function OrderAccordion() {
    const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);

    const handleOpenClientModal = (e: any) => {
        e.stopPropagation();
        setIsClientModalOpen(true);
    }
    const data = [
      {
        name: 'BASIL',
        quantity: 2,
        price: '$20',
      },
      {
        name: 'BEANSPROUT',
        quantity: 4,
        price: '$10',
      },
    ];
    return (
      <>
        <ClientDetailsModal
          open={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
        />
        <Accordion
          sx={{ borderRadius: 2, border: `1px solid white`, width: '100%' }}
        >
          <AccordionSummary>
            <Grid container alignItems="center">
              <Grid item xs={12} md={2}>
                <Typography fontWeight="bold" variant="subtitle1">
                  #1
                </Typography>
                <Typography variant="body2">Date: 03/12/2024</Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Button
                  label="Little Minh"
                  color="blue"
                  onClick={handleOpenClientModal}
                  width="auto"
                />
              </Grid>
              <Grid item xs={12} md={4} textAlign="right">
                <Typography fontWeight="bold" variant="subtitle1">
                  Items: 6
                </Typography>
                <Typography fontWeight="bold" variant="subtitle1">
                  Total: $200
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: grey[50] }}>
            <Grid container>
              <Grid item textAlign="center" xs={12} md={5.9}>
                <Typography fontWeight="bold" variant="h6">
                  ORDER
                </Typography>
                <Table sx={{ minWidth: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.length > 0 &&
                      data.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.quantity}</TableCell>
                          <TableCell>{row.price}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={0.1} textAlign="center">
                <Divider orientation="vertical" />
              </Grid>
              <Grid container item textAlign="center" xs={12} md={5.8}>
                <Grid item xs={12}>
                  <Typography fontWeight="bold" variant="h6">
                    Total Price
                  </Typography>
                </Grid>
                <Grid item xs={4} textAlign="left" ml={2}>
                  <Typography fontWeight="bold">Number of items</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography>2 items</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={4} textAlign="left" ml={2}>
                  <Typography fontWeight="bold">Total</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography>$200</Typography>
                </Grid>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </>
    );
}
