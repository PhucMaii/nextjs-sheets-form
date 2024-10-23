import { IPaymentMethod } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Image from 'next/image';
import React from 'react';
import EditExpense from '../Modals/edit/EditExpense';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import DeleteModal from '../Modals/delete/DeleteModal';

interface IProps {
  transactions: any[];
  paymentMethods?: IPaymentMethod[];
  adminsAndDrivers?: string[];
  showNotification?: (type: AlertColor, message: string) => void;
}

export default function TransactionsTable({
  transactions,
  paymentMethods,
  adminsAndDrivers,
  showNotification,
}: IProps) {
  const handleDeleteTransaction = async (transaction: any) => {
    if (!paymentMethods || !adminsAndDrivers || !showNotification) {
      return;
    }
    try {
      const response = await axios.delete(`${API_URL.ADMIN}/expenses?id=${transaction.id}`);

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
  }

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
          {adminsAndDrivers && paymentMethods && showNotification && <TableCell></TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.length > 0 &&
          transactions.map((transaction: any, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell style={{ width: 50 }}>
                  <Image
                    src={`/${transaction.paymentMethod.type}.png`}
                    alt="method"
                    width={30}
                    height={30}
                  />
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
                {adminsAndDrivers && paymentMethods && showNotification &&<Box display="flex" alignItems="center" gap={1}>
                   <EditExpense
                      transaction={transaction}
                      paymentMethods={paymentMethods}
                      adminsAndDrivers={adminsAndDrivers}
                      showNotification={showNotification}
                    />
                    <DeleteModal 
                      targetObj={transaction}
                      handleDelete={handleDeleteTransaction}
                      includedButton
                    />
                  </Box>
                }
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
