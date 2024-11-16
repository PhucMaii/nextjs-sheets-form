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
import EditStockPurchased from '../Modals/edit/EditStockPurchased';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';

interface IProps {
  transactions: any[];
  showNotification?: (type: AlertColor, message: string) => void;
  setIsOpenLoadingModal?: any;
}

export default function TransactionsTable({
  transactions,
  showNotification,
  setIsOpenLoadingModal
}: IProps) {
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

  const handleUpdateStatus = async (e: any, transaction: any) => {
    if (!showNotification) {
      return;
    }
    
    setIsOpenLoadingModal(true);

    try {
      const response = await axios.put(`${API_URL.ADMIN}/expenses/status`, {
        id: transaction.id,
        status: e.target.value
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsOpenLoadingModal(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsOpenLoadingModal(false);
    } catch (error: any) {
      console.log('Fail to update status: ', error);
      showNotification('error', `Fail to update status: ${error?.respones?.data?.error}`);
      setIsOpenLoadingModal(false);
    }
  }

  return (
    <Table sx={{ overflow: 'scroll' }}>
      <TableHead>
        <TableRow>
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
                <TableCell style={{ width: 100 }}>{transaction.date}</TableCell>
                <TableCell>
                  {/* <Select value={transaction.status} onChange={(e: any) => handleUpdateStatus(transaction, e.target.value)}>
                    {
                      transactionStatusList.map((status: TRANSACTION_STATUS) => {
                        return (
                          <MenuItem key={status} value={status}>
                            <StatusText text={status.toUpperCase()} type={status === TRANSACTION_STATUS.PAID ? 'success' : 'error'} icon={status === TRANSACTION_STATUS.PAID ? <CheckIcon color="success" /> : <CloseIcon color="error" />}  />
                          </MenuItem>
                        )
                      })
                    }
                  </Select> */}
                  <SelectExpenseStatus value={transaction.status} onChange={(e: any) => handleUpdateStatus(e, transaction)} />
                </TableCell>
                <TableCell>
                  {showNotification && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <DeleteModal
                        targetObj={transaction}
                        handleDelete={handleDeleteTransaction}
                        includedButton
                      />
                      {transaction?.orderedItems.length > 0 ? (
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
  );
}
