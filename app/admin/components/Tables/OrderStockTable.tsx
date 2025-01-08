import { IExpense } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import EditStockPurchased from '../Modals/edit/EditStockPurchased';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps {
  stockOrders: IExpense[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function OrderStockTable({
  stockOrders,
  showNotification,
}: IProps) {
  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    stockPurchased: stockOrders[0],
  });
  const [editProps, setEditProps] = useState<any>({
    open: false,
    stockPurchased: stockOrders[0],
  });

  const handleDelete = async (targetObj: IExpense) => {
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/inventory/expenses?id=${targetObj.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Deleted successfully');
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
    }
  };

  return (
    <>
      <EditStockPurchased
        stockPurchased={editProps.stockPurchased}
        showNotification={showNotification}
        open={editProps.open}
        onClose={() =>
          setEditProps({ open: false, stockPurchased: stockOrders[0] })
        }
      />
      <DeleteModal
        open={deleteProps.open}
        handleCloseModal={() =>
          setDeleteProps({ open: false, stockPurchased: stockOrders[0] })
        }
        handleDelete={handleDelete}
        targetObj={deleteProps.stockPurchased}
        showTargetObj={deleteProps.stockPurchased?.invoice}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Method</TableCell>
            <TableCell>Invoice</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Spent By</TableCell>
            <TableCell>Vendors</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Date</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {stockOrders &&
            stockOrders.length > 0 &&
            stockOrders.map((expense: IExpense, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <img
                      src={`/images/${expense.paymentMethod.type}.png`}
                      alt="method"
                      style={{ width: 30, height: 30 }}
                    />
                  </TableCell>
                  <TableCell>{expense?.invoice}</TableCell>
                  <TableCell>${expense.amount}</TableCell>
                  <TableCell>{expense.spentBy}</TableCell>
                  <TableCell>
                    {expense?.vendors
                      ?.map((vendor: any) => vendor.vendor.name)
                      .join(', ')}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Button
                        color="error"
                        onClick={() =>
                          setDeleteProps({
                            open: true,
                            stockPurchased: expense,
                          })
                        }
                      >
                        Delete
                      </Button>
                      {/* <DeleteModal
                        targetObj={expense}
                        handleDelete={handleDelete}
                        includedButton
                      /> */}
                      {/* <EditStockPurchased
                        stockPurchased={expense}
                        showNotification={showNotification}
                      /> */}
                      <Button
                        onClick={() =>
                          setEditProps({ open: true, stockPurchased: expense })
                        }
                      >
                        Edit
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </>
  );
}
