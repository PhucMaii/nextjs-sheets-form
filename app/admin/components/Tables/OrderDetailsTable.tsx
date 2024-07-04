import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { Item, Order } from '../../orders/page';
import { Notification, OrderedItems } from '@/app/utils/type';
import EditItemModal from '../Modals/edit/EditOrderItem';

interface IProps {
  order: Order;
  setNotification: Dispatch<SetStateAction<Notification>>;
  updateUIItem: (targetOrder: Order, targetItem: Item) => void;
}

export default function OrderDetailsTable({
  order,
  setNotification,
  updateUIItem,
}: IProps) {
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<OrderedItems | object>({});
  const [updatedItem, setUpdatedItem] = useState<OrderedItems>({
    name: '',
    price: 0,
    totalPrice: 0,
    quantity: 0,
  });
  useEffect(() => {
    if (Object.keys(selectedItem).length > 0) {
      setIsOpenEditModal(true);
    }
  }, [selectedItem]);
  return (
    <>
      <EditItemModal
        open={isOpenEditModal}
        onClose={() => {
          setIsOpenEditModal(false);
          setSelectedItem({});
        }}
        item={updatedItem}
        setItem={setUpdatedItem}
        setNotification={setNotification}
        updateUIItem={updateUIItem}
        order={order}
      />
      <Table sx={{ minWidth: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.items.length > 0 &&
            order.items.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>${row.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedItem(row);
                      setUpdatedItem(row);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
}
