import { IPurchaseOrder } from '@/app/utils/type';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import StatusText from '../StatusText';
import { PO_STATUS } from '@/app/utils/enum';
import { grey } from '@mui/material/colors';
import { useRouter } from 'next/navigation';

export default function POTable({
  poList,
}: {
  poList: IPurchaseOrder[] | any;
}) {
  const router = useRouter();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>PO Number</TableCell>
          <TableCell>Vendor</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Received</TableCell>
          <TableCell>Total</TableCell>
          <TableCell>Est. Arrival</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {poList.map((po: IPurchaseOrder | any) => (
          <TableRow
            key={po.poNumber}
            sx={{
              '&:hover': {
                backgroundColor: grey[100],
              },
            }}
            onClick={() => router.push(`/admin/purchase-orders/${po.id}`)}
          >
            <TableCell sx={{ fontWeight: 'bold' }}>{po.poNumber}</TableCell>
            <TableCell>{po.vendor.name}</TableCell>
            <TableCell>
              <StatusText
                text={po.status}
                type={
                  po.status === PO_STATUS.DRAFT
                    ? 'warning'
                    : po.status === PO_STATUS.ORDERED
                      ? 'info'
                      : po.status === PO_STATUS.DELIVERED
                        ? 'success'
                        : 'error'
                }
              />
            </TableCell>
            <TableCell>{po?.receivedItems || 0} of {po?.totalItems || 0}</TableCell>
            <TableCell>${po?.totalCost?.toFixed(2) || 0}</TableCell>
            <TableCell>{po.estArrival}</TableCell>
            <TableCell> 
                <Button variant="outlined" color="primary">Mark as Ordered</Button>

            </TableCell>
          </TableRow> 
        ))}
      </TableBody>
    </Table>
  );
}
