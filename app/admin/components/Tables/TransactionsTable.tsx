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
import React, { useState } from 'react';
import EditExpense from '../Modals/edit/EditExpense';
import axios from 'axios';
import { API_URL, TRANSACTION_STATUS } from '@/app/utils/enum';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditStockPurchased from '../Modals/edit/EditStockPurchased';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';
import SingleFieldUpdate from '../Modals/edit/SingleFieldUpdate';
import { SWRFetchData } from '@/app/utils/db';
import { otherPaymentMethodId } from '@/app/lib/constant';
import SingleFieldEdit from '../Modals/edit/SingleFieldEdit';

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
  const [selectPaymentMethod, setSelectPaymentMethod] = useState<any>({
    isOpenModal: false,
    selectedTransaction: null,
    updatedStatus: null,
  });


  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);

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

  const handleUpdateStatus = async (transaction: any, newStatus: TRANSACTION_STATUS, isForce: boolean = false) => {
    if (!showNotification) {
      return;
    }

    if (transaction.paymentMethodId === otherPaymentMethodId && !isForce) {
      setSelectPaymentMethod({
        isOpenModal: true,
        selectedTransaction: transaction,
        updatedStatus: newStatus
      });
      return;
    }
    
    setIsOpenLoadingModal(true);

    try {
      const response = await axios.put(`${API_URL.ADMIN}/expenses/status`, {
        id: transaction.id,
        status: newStatus
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
  
  // const handleUpdateOtherMethodStatus = async (transaction: any, newValue: TRANSACTION_STATUS) => {
  //   if (!showNotification) {
  //     return;
  //   }

  //   setIsOpenLoadingModal(true);
  //   try {
  //     const response = await axios.put(`${API_URL.ADMIN}/expenses/status`, {
  //       id: transaction.id,
  //       status: newValue
  //     });

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       setIsOpenLoadingModal(false);
  //       return;
  //     }

  //     showNotification('success', response.data.message);
  //     setIsOpenLoadingModal(false);
  //   } catch (error: any) {
  //     console.log('There was an error: ', error.response.data.error);
  //     showNotification('error', 'There was an error: ' + error.response.data.error);
  //   }
  // }

  return (
    <>
      <SingleFieldEdit 
        title="Select Payment Method"
        open={selectPaymentMethod.isOpenModal}
        onClose={() => setSelectPaymentMethod({...selectPaymentMethod, isOpenModal: false})}
        handleUpdate={() => handleUpdateStatus(selectPaymentMethod.selectedTransaction, selectPaymentMethod.updatedStatus, true)}
        renderField="name"
        value={}
      />
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
                  <SelectExpenseStatus value={transaction.status} onChange={(e: any) => handleUpdateStatus(transaction, e.target.value)} />
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
    </>
  );
}
