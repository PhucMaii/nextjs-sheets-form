import { ORDER_STATUS } from '@/app/utils/enum';
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Description as DocumentTextIcon } from '@mui/icons-material';
import { PaymentStatus } from '@prisma/client';
import React from 'react';
import StatusText from '../StatusText';
import InfoIcon from '@mui/icons-material/Info';

export default function CheckCODTable({
  isLoadingBoardData,
  selectedClient,
  boardData,
}: {
  isLoadingBoardData: boolean;
  selectedClient: any;
  boardData: any;
}) {
  const getFulFillmentStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
        return 'primary';
      case ORDER_STATUS.INCOMPLETED:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case PaymentStatus.Paid:
        return 'success';
      case PaymentStatus.Unpaid:
        return 'error';
      default:
        return 'default';
    }
  };

  const TableRowSkeleton = () => (
    <TableRow>
      <TableCell>
        <Skeleton variant="text" width="100px" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="120px" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="80px" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100px" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="60px" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="80px" />
      </TableCell>
      <TableCell>
        <Skeleton
          variant="rectangular"
          width={80}
          height={24}
          sx={{ borderRadius: 1 }}
        />
      </TableCell>
      <TableCell>
        <Skeleton
          variant="rectangular"
          width={80}
          height={24}
          sx={{ borderRadius: 1 }}
        />
      </TableCell>
    </TableRow>
  );

  return (
    <Paper
      elevation={1}
      sx={{
        border: 1,
        borderColor: 'grey.200',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Order ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Client Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Client ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Delivery Date
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Order Route
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Items
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Total Bill
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Fulfillment Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                }}
              >
                Payment Status
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingBoardData ? (
              // Show skeleton rows when loading
              [...Array(5)].map((_, index) => <TableRowSkeleton key={index} />)
            ) : (
              <>
                {selectedClient &&
                  selectedClient?.orders.map((order: any) => (
                    <TableRow
                      key={order.id}
                      hover
                      sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                    >
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {order.id}
                      </TableCell>
                      <TableCell>{selectedClient.clientName}</TableCell>
                      <TableCell>{selectedClient.clientId}</TableCell>
                      <TableCell>{order.orderRoute}</TableCell>
                      <TableCell>
                        {order.deliveryDate}
                      </TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        ${order.totalPrice?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getFulFillmentStatusColor(order.status) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.paymentStatus}
                          color={
                            getPaymentStatusColor(order.paymentStatus) as any
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {order.deliveryDate !== boardData?.date && (
                          <StatusText
                            text={`Date difference`}
                            type={'info'}
                            icon={<InfoIcon color="info" fontSize="small" />}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!isLoadingBoardData &&
        selectedClient &&
        selectedClient?.orders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DocumentTextIcon
              sx={{
                fontSize: 48,
                color: 'grey.400',
                mx: 'auto',
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.primary" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This client has no orders to display.
            </Typography>
          </Box>
        )}
    </Paper>
  );
}
