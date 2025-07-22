import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  Chip,
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
import { getAdminApiUrl } from '@/app/utils/enum';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditStockPurchased from '../Modals/edit/EditStockPurchased';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';
import { IExpense } from '@/app/utils/type';
import { grey } from '@mui/material/colors';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const router = useRouter();
  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    transaction: transactions[0],
  });
  const [editProps, setEditProps] = useState<any>({
    open: false,
    transaction: transactions[0],
    type: ExpenseType.other,
  });
  const { companyId }: any = useParams();

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

      // stock purchase
      if (transaction?.orderedItems?.length > 0) {
        response = await axios.delete(
          getAdminApiUrl(companyId, `/inventory/expenses?id=${transaction.id}`),
        );
        // batch transaction
      } else if (transaction?.transactions?.length > 0) {
        response = await axios.delete(
          getAdminApiUrl(companyId, `/batch-transactions?id=${transaction.id}`),
        );
        // other expense
      } else {
        response = await axios.delete(
          getAdminApiUrl(companyId, `/expenses?id=${transaction.id}`),
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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'batch':
        return {
          backgroundColor: '#f8f9ff',
          borderLeft: '4px solid #1976d2',
          chipColor: 'primary' as const,
          chipVariant: 'filled' as const,
          fontWeight: 600,
        };
      case 'stock':
        return {
          backgroundColor: '#f3f8f3',
          borderLeft: '4px solid #388e3c',
          chipColor: 'success' as const,
          chipVariant: 'filled' as const,
          fontWeight: 600,
        };
      case 'other':
        return {
          backgroundColor: 'inherit',
          borderLeft: 'none',
          chipColor: 'default' as const,
          chipVariant: 'outlined' as const,
          fontWeight: 400,
        };
      default:
        return {
          backgroundColor: 'inherit',
          borderLeft: 'none',
          chipColor: 'default' as const,
          chipVariant: 'outlined' as const,
          fontWeight: 400,
        };
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
        handleDelete={(_e: any, transaction: any) =>
          handleDeleteTransaction(transaction)
        }
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
              <TableCell>Type</TableCell>
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
                const type = transaction?.transactions
                  ? 'batch'
                  : transaction?.orderedItems?.length > 0
                    ? 'stock'
                    : 'other';

                // Define styling based on transaction type

                const typeStyles = getTypeStyles(type);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { backgroundColor: grey[50] },
                      // backgroundColor: typeStyles.backgroundColor,
                      // borderLeft: typeStyles.borderLeft,
                    }}
                    onClick={
                      () =>
                        router.push(
                          `/admin/${companyId}/transactions/${transaction.id}?type=${type}`,
                        )
                      // setEditProps({
                      //   open: true,
                      //   transaction,
                      //   type:
                      //     transaction?.orderedItems?.length > 0
                      //       ? ExpenseType.stockPurchased
                      //       : ExpenseType.other,
                      // })
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
                      <Image
                        src={`/images/${transaction?.paymentMethod?.type}.png`}
                        alt="method"
                        style={{ width: 30, height: 30 }}
                        width={100}
                        height={100}
                        loading="lazy"
                      />
                      {/* </Toolbar> */}
                    </TableCell>
                    <TableCell style={{ width: 120 }}>
                      <Chip
                        label={type}
                        size="small"
                        color={typeStyles.chipColor}
                        variant={typeStyles.chipVariant}
                        sx={{
                          fontSize: '0.75rem',
                          height: '20px',
                          fontWeight: typeStyles.fontWeight,
                        }}
                      />
                    </TableCell>
                    <TableCell style={{ width: 50 }}>
                      {transaction?.invoice}
                    </TableCell>
                    <TableCell style={{ width: 100 }}>
                      ${transaction?.amount || transaction?.total}
                    </TableCell>
                    <TableCell style={{ width: 300 }}>
                      {transaction?.vendors &&
                        transaction?.vendors[0]?.vendor?.name}
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
                            onClick={() =>
                              // setEditProps({
                              //   open: true,
                              //   transaction,
                              //   type:
                              //     transaction?.orderedItems?.length > 0
                              //       ? ExpenseType.stockPurchased
                              //       : ExpenseType.other,
                              // })
                              router.push(
                                `/admin/${companyId}/transactions/${transaction.id}?type=${type}`,
                              )
                            }
                          >
                            Edit
                          </Button>
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
