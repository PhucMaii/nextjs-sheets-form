import { header } from '@/app/lib/print';
import {
  Paper,
  Table,
  TableContainer,
  TableRow,
  TableHead,
  Typography,
  TableCell,
  TableBody,
  Divider,
} from '@mui/material';
import { Box } from '@mui/material';
import { forwardRef } from 'react';

export const POInvoice = forwardRef(({ vendor, po }: any, ref: any) => {
  if (!vendor || !po) {
    return null;
  }

  return (
    <div ref={ref}>
      <Box p={2}>
        {header()}

        <Divider sx={{ my: 3, backgroundColor: 'black' }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="h6">Vendor:</Typography>
            <Typography variant="h6" fontWeight="normal">
              {vendor.name}
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="h6">PO Number:</Typography>
            <Typography variant="h6" fontWeight="normal">
              #{po.poNumber}
            </Typography>
          </Box>
          {/* Expected Arrival Date */}
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="h6">Expected Arrival Date:</Typography>
            <Typography variant="h6" fontWeight="normal">
              {po.estArrival}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Purchase Order Details:</Typography>
            <TableContainer elevation={0} component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {po.poItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.inventoryItem.name}</TableCell>
                      <TableCell>
                        {item.orderedQty} {item?.inventoryUnit?.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Notes */}
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="h6">Notes:</Typography>
            <Typography variant="h6" fontWeight="normal">
              {po.note}
            </Typography>
          </Box>
        </Box>
      </Box>
    </div>
  );
});
