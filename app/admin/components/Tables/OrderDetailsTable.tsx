import {
  AlertColor,
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
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { Order } from '../../orders/page';
import { OrderedItems } from '@/app/utils/type';
import EditItemModal from '../Modals/edit/EditOrderItem';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { API_URL, TYPE, USER_ROLE } from '@/app/utils/enum';

interface IProps {
  order: Order;
  items: OrderedItems[];
  setItems?: Dispatch<SetStateAction<OrderedItems[]>>;
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
    isConvertToCustom?: boolean,
  ) => Promise<void>;
  abilityToEdit?: boolean;
  showNotification?: (type: AlertColor, message: string) => void;
  role: USER_ROLE;
}

export default function OrderDetailsTable({
  order,
  items,
  setItems,
  handleUpdateItem,
  abilityToEdit,
  showNotification,
  role,
}: IProps) {
  const [deleteModalProps, setDeleteModalProps] = useState<any>({
    open: false,
    targetObj: {},
  });
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<OrderedItems | object>({});
  const [updatedItem, setUpdatedItem] = useState<OrderedItems>({
    name: '',
    price: 0,
    totalPrice: 0,
    quantity: 0,
  });

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (Object.keys(selectedItem).length > 0) {
      setIsOpenEditModal(true);
    }
  }, [selectedItem]);

  const mdDown = useMediaQuery((them: any) => them.breakpoints.down('md'));

  const handleDeleteItem = async (targetObj: OrderedItems) => {
    if (!showNotification) return;
    if (role === USER_ROLE.CLIENT || role === USER_ROLE.DRIVER) {
      showNotification('error', 'You do not have permission to delete items');
    }
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/orderedItems?id=${targetObj.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (setItems) {
        const newItems = items.filter((i: any) => i.id !== targetObj.id);
        setItems(newItems);
      }
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  return (
    <>
      <DeleteModal
        targetObj={deleteModalProps.targetObj}
        handleDelete={handleDeleteItem}
        open={deleteModalProps.open}
        handleCloseModal={() =>
          setDeleteModalProps({ open: false, targetObj: {} })
        }
        showTargetObj={deleteModalProps.targetObj?.name}
      />
      {updatedItem.id ? (
        <EditItemModal
          open={isOpenEditModal}
          onClose={() => {
            setIsOpenEditModal(false);
            setSelectedItem({});
          }}
          item={updatedItem}
          handleUpdateItem={handleUpdateItem}
          order={order}
          role={role as USER_ROLE}
        />
      ): null}
      <Table sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: 50 }}>
              {smDown ? 'Qty' : 'Quantity'}
            </TableCell>
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
                        <Typography>
                          {item?.isCustomAmount ? '(C)' : null} {item.name}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      {item?.isCustomAmount ? '(C)' : null} {item.name}
                    </>
                  )}
                </TableCell>
                <TableCell sx={{ width: 50 }}>{item.quantity}</TableCell>
                <TableCell>
                  <Box
                    display="flex"
                    flexDirection={smDown ? 'column' : 'row'}
                    gap={1}
                  >
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
                    <Typography>
                      ${item?.totalPrice?.toFixed(2) || 0}
                    </Typography>
                  </Box>
                </TableCell>

                {!mdDown && abilityToEdit && (
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        disabled={order?.type === TYPE.LOCKED}
                        onClick={() => {
                          setSelectedItem(item);
                          setUpdatedItem(item);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      {(item?.isCustomAmount || !item?.inventoryItemId) &&
                        showNotification && (
                          <IconButton
                            color="error"
                            disabled={
                              order?.type === TYPE.LOCKED ||
                              role === USER_ROLE.CLIENT ||
                              role === USER_ROLE.DRIVER
                            }
                            onClick={() =>
                              setDeleteModalProps({
                                open: true,
                                targetObj: item,
                              })
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
}
