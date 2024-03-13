'use client';
import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Button from '@/app/components/Button';
import { grey } from '@mui/material/colors';
import ClientDetailsModal from '../Modals/ClientDetailsModal';
import { Order } from '../../overview/page';

export default function OrderAccordion({ order }: { order: Order }) {
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);

  const handleOpenClientModal = (e: any) => {
    e.stopPropagation();
    setIsClientModalOpen(true);
  };
  return (
    <>
      <ClientDetailsModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        deliveryAddress={order.deliveryAddress}
        contactNumber={order.contactNumber}
        categoryName={order.category}
      />
      <Accordion
        sx={{ borderRadius: 2, border: `1px solid white`, width: '100%' }}
      >
        <AccordionSummary>
          <Grid container alignItems="center">
            <Grid item xs={12} md={2}>
              <Typography fontWeight="bold" variant="subtitle1">
                #{order.id}
              </Typography>
              <Typography variant="body2">Date: {order.date}</Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Button
                label={order.clientName}
                color="blue"
                onClick={handleOpenClientModal}
                width="auto"
              />
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Typography fontWeight="bold" variant="subtitle1">
                Items: {order.items.length}
              </Typography>
              <Typography fontWeight="bold" variant="subtitle1">
                Total: ${order.totalPrice}
              </Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: grey[50] }}>
          <Grid container rowGap={4}>
            <Grid item textAlign="center" xs={12}>
              <Typography fontWeight="bold" variant="h6">
                ORDER
              </Typography>
              <Table sx={{ minWidth: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.length > 0 &&
                    order.items.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>${row.price}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid
              container
              item
              textAlign="center"
              alignItems="center"
              rowGap={2}
              xs={12}
            >
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography fontWeight="bold">Number of items</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">
                  {order.items.length} items
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography fontWeight="bold">Total</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">${order.totalPrice}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
