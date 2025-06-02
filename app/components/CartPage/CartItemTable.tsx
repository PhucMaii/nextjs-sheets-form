import { ICartItem } from '@/app/utils/type';
import { RootState } from '@/state/store';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import CheckoutItemRow from './CheckoutItemRow';

interface IProps {
  showNotification: any;
}

export default function CartItemTable({ showNotification }: IProps) {
  const cart: any = useSelector((state: RootState) => state.cart);

  return (
    <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
      <Table sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
          <TableCell>Product</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Total Price</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {cart.items.length > 0 &&
          cart.items.map((item: ICartItem) => (
            <CheckoutItemRow
              key={item.id}
              item={item}
              showNotification={showNotification}
              cart={cart}
            />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
