import {
  AlertColor,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  // Toolbar,
} from '@mui/material';
import React from 'react';
import EditExpense from '../Modals/edit/EditExpense';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import DeleteModal from '../Modals/delete/DeleteModal';

interface IProps {
  transactions: any[];
  showNotification?: (type: AlertColor, message: string) => void;
}

export default function TransactionsTable({
  transactions,
  showNotification,
}: IProps) {
  const handleDeleteTransaction = async (transaction: any) => {
    if (!showNotification) {
      return;
    }
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/expenses?id=${transaction.id}`,
      );

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
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Method</TableCell>
          <TableCell>Id</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Spent By</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>When</TableCell>
          {showNotification && <TableCell></TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.length > 0 &&
          transactions.map((transaction: any, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell style={{ width: 50 }}>
                  {/* <Toolbar> */}
                  <img
                    src={`/images/${transaction.paymentMethod.type}.png`}
                    alt="method"
                    style={{ width: 30, height: 30 }}
                  />
                  {/* </Toolbar> */}
                </TableCell>
                <TableCell style={{ width: 50 }}>{transaction.id}</TableCell>
                <TableCell style={{ width: 100 }}>
                  ${transaction.amount}
                </TableCell>
                <TableCell style={{ width: 150 }}>
                  {transaction.spentBy}
                </TableCell>
                <TableCell style={{ width: 300 }}>
                  {transaction.description}
                </TableCell>
                <TableCell style={{ width: 100 }}>{transaction.date}</TableCell>
                <TableCell>
                  {showNotification && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <DeleteModal
                        targetObj={transaction}
                        handleDelete={handleDeleteTransaction}
                        includedButton
                      />
                      <EditExpense
                        transaction={transaction}
                        showNotification={showNotification}
                      />
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
