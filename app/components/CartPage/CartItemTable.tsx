import { ICartItem } from '@/app/utils/type';
import { RootState } from '@/state/store';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import CheckoutItemRow from './CheckoutItemRow';
import { ShowNotificationType } from '@/hooks/useNotification';

interface IProps {
    showNotification: ShowNotificationType;
}

export default function CartItemTable({showNotification}: IProps) {
    const cart = useSelector((state: RootState) => state.cart);

  return (
    <Table>
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
        {
            cart.items.length > 0 && cart.items.map((item: ICartItem) => (
                <CheckoutItemRow 
                    key={item.id} 
                    item={item} 
                    showNotification={showNotification} 
                    cart={cart} 
                />
            ))
        }
      </TableBody>
    </Table>
  );
}
