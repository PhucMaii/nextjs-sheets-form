import { generateImgUrl } from '@/app/lib/s3';
import {
  TableHead,
  TableRow,
  Box,
  Grid,
  Table,
  Typography,
  TableBody,
} from '@mui/material';

import React, { forwardRef } from 'react';
import { BorderTableCell } from './ManifestPrint';
import { CheckIcon, XIcon } from 'lucide-react';
const ExportCategory = forwardRef(({ items }: any, ref: any) => {
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

      <Grid container spacing={1} alignItems="center">
        <Grid item xs={6}>
          <img
            src="/supremesproutsLogo.ico"
            alt="Supreme Sprouts Ltd."
            width={40}
            height={40}
          />
          <Typography variant="h6">Supreme Sprouts Ltd.</Typography>
          <Box>
            <Typography variant="subtitle1">
              Unit 1 - 6420 Beresford Street
            </Typography>
            <Typography variant="subtitle1">
              Burnaby, British Columbia V5E 1B6, Canada
            </Typography>
            <Typography variant="subtitle1">778 789 1060</Typography>
            <Typography variant="subtitle1">709 989 6000</Typography>
          </Box>
        </Grid>
        {/* <Grid item xs={6}>
          <Typography variant="body1">
            <strong>For:</strong> {clientName}
          </Typography>
        </Grid> */}
        <Grid item xs={6} textAlign="right">
          <Typography variant="body1">
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </Typography>
        </Grid>
        {/* <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Category:</strong> {category?.name}
          </Typography>
        </Grid> */}
      </Grid>

      {/* Items */}
      <Typography variant="body1" fontWeight="bold" sx={{ my: 1.5 }}>
        Product Pricing
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <BorderTableCell align="center">Image</BorderTableCell>
            <BorderTableCell sx={{ paddingX: 2 }}>Product</BorderTableCell>
            <BorderTableCell align="center">UOM</BorderTableCell>
            <BorderTableCell align="center">Price</BorderTableCell>
            <BorderTableCell align="center">Available</BorderTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item: any) => (
            <TableRow key={item.id} sx={{ height: 35 }}>
              <BorderTableCell align="center">
                {item?.image || item?.inventoryItem?.image ? (
                  <img
                    src={generateImgUrl(
                      item?.image || item?.inventoryItem?.image,
                    )}
                    alt={item?.name}
                    width={30}
                    height={30}
                  />
                ) : null}
              </BorderTableCell>
              <BorderTableCell sx={{ paddingX: 2 }}>
                <Typography variant="body1" fontWeight="bold">
                  {item?.name}
                </Typography>
              </BorderTableCell>
              <BorderTableCell align="center">{item?.uom}</BorderTableCell>
              <BorderTableCell align="center">
                ${item?.price?.toFixed(2)}
              </BorderTableCell>
              <BorderTableCell align="center">
                {item?.availability ? <CheckIcon /> : <XIcon />}
              </BorderTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export default ExportCategory;
