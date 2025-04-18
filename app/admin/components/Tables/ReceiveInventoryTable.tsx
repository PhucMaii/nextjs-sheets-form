import {
  Box,
  Typography,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TextField,
  Button,
} from '@mui/material';
import React from 'react';
import ReceivedProgress from '../ReceivedProgress';

export default function ReceiveInventoryTable({ poItems, setPoItems }: any) {
  const onFillAll = (id: number, type: 'receivedQty' | 'rejectedQty') => {
    setPoItems((prev: any) =>
      prev.map((i: any) => (i.id === id ? { ...i, [type]: i.orderedQty } : i)),
    );
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Item</TableCell>
          <TableCell>Accept</TableCell>
          <TableCell>Reject</TableCell>
          <TableCell>Received</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {poItems.map((item: any) => (
          <TableRow key={item.id}>
            <TableCell>{item?.inventoryItem?.name}</TableCell>
            <TableCell>
              <Box display="flex" gap={1}>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={item?.receivedQty || 0}
                  onChange={(e) =>
                    setPoItems((prev: any) =>
                      prev.map((i: any) =>
                        i.id === item.id
                          ? { ...i, receivedQty: +e.target.value }
                          : i,
                      ),
                    )
                  }
                />
                <Button
                  variant="contained"
                  size="small"
                  color="inherit"
                  sx={{
                    boxShadow: 'none',
                  }}
                  onClick={() => onFillAll(item.id, 'receivedQty')}
                >
                  All
                </Button>
              </Box>
            </TableCell>
            <TableCell>
              <Box display="flex" gap={1}>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={item?.rejectedQty || 0}
                  onChange={(e) =>
                    setPoItems((prev: any) =>
                      prev.map((i: any) =>
                        i.id === item.id
                          ? { ...i, rejectedQty: +e.target.value }
                          : i,
                      ),
                    )
                  }
                />
                <Button
                  variant="contained"
                  size="small"
                  color="inherit"
                  sx={{ boxShadow: 'none' }}
                  onClick={() => onFillAll(item.id, 'rejectedQty')}
                >
                  All
                </Button>
              </Box>
            </TableCell>
            <TableCell>
              <Box display="flex" flexDirection="column" gap={1}>
                <ReceivedProgress
                  receivedQty={item?.receivedQty || 0}
                  rejectedQty={item?.rejectedQty || 0}
                  orderedQty={item?.orderedQty}
                />
                <Typography variant="body2">
                  {(item?.receivedQty || 0) + (item?.rejectedQty || 0)} of{' '}
                  {item?.orderedQty}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
