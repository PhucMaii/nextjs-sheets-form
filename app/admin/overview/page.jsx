import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

export default function MainPage() {
  const data = [
    {
      clientName: 'Little Minh',
      clientAddress: '7533 Market Crossing, Burnaby, BC V3M 2E1',
      contactNumber: '111111',
      category: 'Special Customers',
      orderDate: '03/11/2024',
      totalPrice: 300,
    },
    {
      clientName: 'Pho Mr Do',
      clientAddress: 'Vancouver BC',
      contactNumber: '111111',
      category: 'Restaurant',
      orderDate: '03/11/2024',
      totalPrice: 530,
    },
    {
      clientName: 'Costco',
      clientAddress: 'Chinatown',
      contactNumber: '111111',
      category: 'Supermarket',
      orderDate: '03/11/2024',
      totalPrice: 600,
    }
  ];

  // const fetchOrders = async () => {
  //   try {
  //     const response = 
  //   } catch (error) {
  //     console.log('Fail to fetch orders: ' + error);
  //   }
  // }
  return (
    <Sidebar>
      <Box display="flex" flexDirection="column" m={4} gap={2}>
        <Typography fontWeight="bold" variant="h4">
          Today&apos;s Order
        </Typography>
        <Paper sx={{boxShadow:'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: 2}}>
          <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 && data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.clientAddress}</TableCell>
                    <TableCell>{row.contactNumber}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.orderDate}</TableCell>
                    <TableCell>{row.totalPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </Paper>
      </Box>
    </Sidebar>
  );
}