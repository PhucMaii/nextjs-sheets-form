import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  // Toolbar,
} from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import EditExpense from '../Modals/edit/EditExpense';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditStockPurchased from '../Modals/edit/EditStockPurchased';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';
import { IExpense } from '@/app/utils/type';
import { grey } from '@mui/material/colors';

interface IProps {
  transactions: IExpense[];
  handleUpdateStatus?: any;
  showNotification?: (type: AlertColor, message: string) => void;
  selectedExpense?: IExpense[];
  handleSelectExpense?: any;
  handleSelectAll?: any;
  adminsAndDrivers?: any;
}

enum ExpenseType {
  stockPurchased = 'stockPurchased',
  other = 'other',
}

const TransactionsTable = ({
  transactions,
  showNotification,
  handleUpdateStatus,
  selectedExpense,
  handleSelectExpense,
  handleSelectAll,
}: IProps) => {
  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    transaction: transactions[0],
  });
  const [editProps, setEditProps] = useState<any>({
    open: false,
    transaction: transactions[0],
    type: ExpenseType.other,
  });

  useEffect(() => {
    if (transactions.length > 0) {
      setEditProps({
        open: false,
        transaction: transactions[0],
        type: ExpenseType.other,
      });
    }
  }, [transactions]);

  const handleDeleteTransaction = async (transaction: any) => {
    if (!showNotification) {
      return;
    }
    try {
      let response;

      if (transaction?.orderedItems?.length > 0) {
        response = await axios.delete(
          `${API_URL.ADMIN}/inventory/expenses?id=${transaction.id}`,
        );
      } else {
        response = await axios.delete(
          `${API_URL.ADMIN}/expenses?id=${transaction.id}`,
        );
      }

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      return;
    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong');
      return;
    }
  };

  return (
    <>
      <DeleteModal
        open={deleteProps.open}
        handleCloseModal={() =>
          setDeleteProps((prevState: any) => ({ ...prevState, open: false }))
        }
        targetObj={deleteProps.transaction}
        handleDelete={handleDeleteTransaction}
        showTargetObj={deleteProps.transaction?.invoice}
      />
      {editProps.type === ExpenseType.stockPurchased && showNotification && (
        <EditStockPurchased
          open={editProps.open}
          onClose={() =>
            setEditProps((prevState: any) => ({
              ...prevState,
              open: false,
              type: null,
            }))
          }
          stockPurchased={editProps.transaction}
          showNotification={showNotification}
        />
      )}

      {editProps.type === ExpenseType.other && showNotification && (
        <EditExpense
          open={editProps.open}
          onClose={() =>
            setEditProps((prevState: any) => ({
              ...prevState,
              open: false,
              type: null,
            }))
          }
          transaction={editProps.transaction}
          showNotification={showNotification}
        />
      )}
      <Paper sx={{ overflow: 'scroll' }}>
        <Table>
          <TableHead>
            <TableRow>
              {selectedExpense && (
                <TableCell padding="checkbox" variant="head">
                  <Checkbox
                    checked={selectedExpense.length === transactions.length}
                    onClick={handleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell>Method</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Spent By</TableCell>
              <TableCell>When</TableCell>
              <TableCell>Status</TableCell>
              {showNotification && <TableCell></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 &&
              transactions.map((transaction: any, index: number) => {
                const isExpenseSelected = selectedExpense?.some(
                  (expense: IExpense) => expense.id === transaction.id,
                );
                return (
                  <TableRow
                    key={index}
                    sx={{ '&:hover': { backgroundColor: grey[50] } }}
                    onClick={() =>
                      setEditProps({
                        open: true,
                        transaction,
                        type:
                          transaction?.orderedItems?.length > 0
                            ? ExpenseType.stockPurchased
                            : ExpenseType.other,
                      })
                    }
                  >
                    {selectedExpense && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          onClick={(e) => handleSelectExpense(e, transaction)}
                          checked={isExpenseSelected}
                        />
                      </TableCell>
                    )}
                    <TableCell style={{ width: 50 }}>
                      {/* <Toolbar> */}
                      <img
                        src={`/images/${transaction?.paymentMethod?.type}.png`}
                        alt="method"
                        style={{ width: 30, height: 30 }}
                      />
                      {/* </Toolbar> */}
                    </TableCell>
                    <TableCell style={{ width: 50 }}>
                      {transaction?.invoice}
                    </TableCell>
                    <TableCell style={{ width: 100 }}>
                      ${transaction.amount}
                    </TableCell>
                    <TableCell style={{ width: 300 }}>
                      {transaction?.vendors[0]?.vendor?.name}
                    </TableCell>
                    <TableCell style={{ width: 300 }}>
                      {transaction.description}
                    </TableCell>
                    <TableCell style={{ width: 150 }}>
                      {transaction.spentBy}
                    </TableCell>
                    <TableCell style={{ width: 100 }}>
                      {transaction.date}
                    </TableCell>
                    <TableCell>
                      <SelectExpenseStatus
                        value={transaction.status}
                        onChange={(e: any) =>
                          handleUpdateStatus(transaction, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {showNotification && (
                        <Box display="flex" alignItems="center" gap={1}>
                          {/* <DeleteModal
                            targetObj={transaction}
                            handleDelete={handleDeleteTransaction}
                            includedButton
                          /> */}
                          <Button
                            color="error"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setDeleteProps({ open: true, transaction });
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            onClick={() =>
                              setEditProps({
                                open: true,
                                transaction,
                                type:
                                  transaction?.orderedItems?.length > 0
                                    ? ExpenseType.stockPurchased
                                    : ExpenseType.other,
                              })
                            }
                          >
                            Edit
                          </Button>
                          {/* {adminsAndDrivers &&
                          transaction?.orderedItems?.length > 0 ? (
                            <EditStockPurchased
                              stockPurchased={transaction}
                              showNotification={showNotification}
                            />
                          ) : (
                            <EditExpense
                              transaction={transaction}
                              showNotification={showNotification}
                            />
                          )} */}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default memo(TransactionsTable, (prev, next) => {
  return (
    prev.transactions === next.transactions &&
    prev.selectedExpense === next.selectedExpense
  );
});
