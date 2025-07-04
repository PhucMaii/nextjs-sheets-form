import { OrderedItems } from '@/app/utils/type';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableContainer,
  Typography,
  Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { gstRate, pstRate } from '@/app/lib/constant';
import { generateImgUrl } from '@/app/lib/s3';
import Image from 'next/image';
import { error } from '@/theme/color';

const OrderedItemRow = ({ item }: { item: OrderedItems }) => {
  const [img, setImg] = useState<string>('/images/not-found.png');

  useEffect(() => {
    if (item.inventoryItem.image) {
      generateImgUrl(item.inventoryItem.image).then((url) => {
        console.log(url, 'url');
        setImg(url);
      });
    }
  }, [item.inventoryItem.image]);
  return (
    <TableRow>
      <TableCell sx={{ py: 0.5, px: 0 }}>
        <Image
          src={img ? img : '/images/not-found.png'}
          alt={item.inventoryItem.name}
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
          loading="lazy"
        />
      </TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>{item.name}</TableCell>
      <TableCell sx={{ fontSize: 16 }}>{item.quantity}</TableCell>
      <TableCell sx={{ fontSize: 16 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={700}>
            ${item.price?.toFixed(2)}
          </Typography>
          {item?.isShowDiscount && item?.prevPrice ? (
            // <Chip
            //   label={`$${item?.prevPrice?.toFixed(2)}`}
            //   color="error"
            //   size="small"
            //   sx={{ fontSize: 12, textDecoration: 'line-through' }}
            //   variant="outlined"
            // />
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ textDecoration: 'line-through', color: error.main }}
            >
              ${item?.prevPrice?.toFixed(2)}
            </Typography>
          ) : null}
        </Box>
      </TableCell>
      <TableCell sx={{ fontSize: 16 }}>
        ${item.inventoryItem.hasGST ? (item.price * gstRate)?.toFixed(2) : 0}
      </TableCell>
      <TableCell sx={{ fontSize: 16 }}>
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
    <TableContainer sx={{ width: '100%', overflow: 'scroll' }}>
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
    </TableContainer>
  );
};

export default OrderedItemsTable;
