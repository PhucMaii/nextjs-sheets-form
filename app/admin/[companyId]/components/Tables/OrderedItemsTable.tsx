import { OrderedItems } from '@/app/utils/type';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { gstRate, pstRate } from '@/app/lib/constant';
import { generateImgUrl } from '@/app/lib/s3';

const OrderedItemRow = ({ item }: { item: OrderedItems }) => {
  const [img, setImg] = useState<string>('');

  useEffect(() => {
    if (item.inventoryItem.image) {
      generateImgUrl(item.inventoryItem.image).then((url) => {
        setImg(url);
      });
    }
  }, [item.inventoryItem.image]);
  return (
    <TableRow>
      <TableCell sx={{ py: 0.5, px: 0 }}>
        <img
          src={img}
          alt={item.inventoryItem.name}
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </TableCell>
      <TableCell sx={{ p: 0.5, fontWeight: 700, fontSize: 16 }}>{item.name}</TableCell>
      <TableCell sx={{ p: 0.5, fontSize: 16 }}>{item.quantity}</TableCell>
      <TableCell sx={{ p: 0.5, fontSize: 16 }}>${item.price?.toFixed(2)}</TableCell>
      <TableCell sx={{ p: 0.5, fontSize: 16 }}>
        ${item.inventoryItem.hasGST ? (item.price * gstRate)?.toFixed(2) : 0}
      </TableCell>
      <TableCell sx={{ p: 0.5, fontSize: 16 }}>
        ${item.inventoryItem.hasPST ? (item.price * pstRate)?.toFixed(2) : 0}
      </TableCell>
      <TableCell sx={{ p: 0.5, fontWeight: 700, fontSize: 16 }}>
        ${(item.price * item.quantity)?.toFixed(2)}
      </TableCell>
    </TableRow>
  );
};
interface IProps {
  items: OrderedItems[];
}

const OrderedItemsTable = ({ items }: IProps) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>Item</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Unit Price</TableCell>
          <TableCell>GST</TableCell>
          <TableCell>PST</TableCell>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <OrderedItemRow key={item.id} item={item} />
        ))}
      </TableBody>
    </Table>
  );
};

export default OrderedItemsTable;
