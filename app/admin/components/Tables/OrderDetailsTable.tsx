import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { Order } from '../../orders/page';
import { OrderedItems } from '@/app/utils/type';
import EditItemModal from '../Modals/edit/EditOrderItem';

interface IProps {
  order: Order;
  items: OrderedItems[];
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => Promise<void>;
  abilityToEdit?: boolean;
}

export default function OrderDetailsTable({ order, items, handleUpdateItem, abilityToEdit }: IProps) {
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

  const mdDown = useMediaQuery((them: any) => them.breakpoints.down('md'));

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
        handleUpdateItem={handleUpdateItem}
        order={order}
      />
      <Table sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
            {!mdDown && <TableCell></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 &&
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  {mdDown && abilityToEdit ? (
                    <>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <IconButton
                          onClick={() => {
                            setSelectedItem(item);
                            setUpdatedItem(item);
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <Typography>{item.name}</Typography>
                      </Box>
                    </>
                  ) : (
                    <>{item.name}</>
                  )}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="row" gap={1}>
                    {item?.isShowDiscount &&
                      item?.prevPrice &&
                      (item.prevPrice * item.quantity).toFixed(2) !==
                        item.totalPrice.toFixed(2) && (
                        <Typography
                          sx={{ textDecoration: 'line-through' }}
                          color="error"
                        >
                          ${(item.prevPrice * item.quantity).toFixed(2)}
                        </Typography>
                      )}
                    <Typography>${item?.totalPrice?.toFixed(2) || 0}</Typography>
                  </Box>
                </TableCell>

                {!mdDown && abilityToEdit && (
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedItem(item);
                        setUpdatedItem(item);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
}
