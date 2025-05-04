import { generateImgUrl } from '@/app/lib/s3';
import {
  TableHead,
  TableRow,
  Box,
  Grid,
  Table,
  Typography,
  TableCell,
  TableBody,
} from '@mui/material';
import React, { forwardRef } from 'react';
const ExportCategory = forwardRef(({ category, clientName }: any, ref: any) => {
  return (
    <div ref={ref} style={{ padding: '20px' }}>
      {/* Header */}

      {/* 
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Typography variant="body1">For: {clientName}</Typography>
        <Typography variant="body1">
          Date: {new Date().toLocaleDateString()}
        </Typography>
      </Box> */}

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Box
            display="flex"
            // justifyContent="center"
            alignItems="center"
            gap={1}
          >
            <img
              src="/supremesproutsLogo.ico"
              alt="Supreme Sprouts Ltd."
              width={50}
              height={50}
            />
            <Typography variant="h6">Supreme Sprouts Ltd.</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>For:</strong> {clientName}
          </Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography variant="body1">
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Category:</strong> {category?.name}
          </Typography>
        </Grid>
      </Grid>

      {/* Items */}
      <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
        Product Pricing
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Image</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Qty / Unit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {category?.items.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>
                {item?.inventoryItem?.image ? (
                  <img
                    src={generateImgUrl(item?.inventoryItem?.image)}
                    alt={item?.name}
                    width={50}
                    height={50}
                  />
                ) : null}
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>${item.price?.toFixed(2)}</TableCell>
              <TableCell>{item?.inventoryUnit?.ratio} {item?.inventoryUnit?.unit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export default ExportCategory;
