import {
  AlertColor,
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  // Toolbar,
} from '@mui/material';
import React, { memo } from 'react';
import EditExpense from '../Modals/edit/EditExpense';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditStockPurchased from '../Modals/edit/EditStockPurchased';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';
import { IExpense } from '@/app/utils/type';

interface IProps {
  transactions: IExpense[];
  handleUpdateStatus?: any;
  showNotification?: (type: AlertColor, message: string) => void;
  selectedExpense?: IExpense[];
  handleSelectExpense?: any;
  handleSelectAll?: any;
}

const TransactionsTable = ({
  transactions,
  showNotification,
  handleUpdateStatus,
  selectedExpense,
  handleSelectExpense,
  handleSelectAll,
}: IProps) => {
  console.log('TABLE RE RENDER');

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
                <TableRow key={index}>
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
                        <DeleteModal
                          targetObj={transaction}
                          handleDelete={handleDeleteTransaction}
                          includedButton
                        />
                        {transaction?.orderedItems?.length > 0 ? (
                          <EditStockPurchased
                            stockPurchased={transaction}
                            showNotification={showNotification}
                          />
                        ) : (
                          <EditExpense
                            transaction={transaction}
                            showNotification={showNotification}
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default memo(TransactionsTable, (prev, next) => {
  return (
    prev.transactions === next.transactions &&
    prev.selectedExpense === next.selectedExpense
  );
});
