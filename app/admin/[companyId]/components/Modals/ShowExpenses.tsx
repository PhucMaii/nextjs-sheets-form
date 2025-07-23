import { AlertColor, Box, Button, Divider, Modal } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import { IExpense } from '@/app/utils/type';
import TransactionsTable from '../Tables/TransactionsTable';
import AddExpense from './add/AddExpense';
import ErrorComponent from '../ErrorComponent';
import { useUpdateExpenseStatus } from '@/hooks/update/useUpdateExpenseStatus';
import LoadingModal from './LoadingModal';
import { useParams, useRouter } from 'next/navigation';

interface IProps extends ModalProps {
  expenses: IExpense[];
  showNotification: (type: AlertColor, message: string) => void;
  boardData: any;
}

export default function ShowExpenses({
  open,
  onClose,
  expenses,
  showNotification,
  boardData,
}: IProps) {
  const { companyId }: any = useParams();
  const router = useRouter();
  // const [isOpenAddExpense, setIsOpenAddExpense] = useState<boolean>(false);

  const { handleUpdateStatus, UpdateExpenseStatusComp, isUpdating } =
    useUpdateExpenseStatus(showNotification);

  const totalAmount = useMemo(() => {
    if (expenses.length === 0) {
      return 0;
    }

    const total = expenses.reduce((acc: number, expense: IExpense) => {
      return acc + expense.amount;
    }, 0);

    return total;
  }, [expenses]);

  return (
    <>
      {UpdateExpenseStatusComp}
      <LoadingModal open={isUpdating} />
      {/* <AddExpense
        open={isOpenAddExpense}
        onClose={() => setIsOpenAddExpense(false)}
        showNotification={showNotification}
        // handleAddExpenseId={handleAddExpenseId}
        defaultValue={{
          date: boardData.date,
          spentBy: `Driver - ${boardData?.employee?.name || 'N/A'} `,
        }}
        codBoardId={boardData.id}
      /> */}
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll" width="800px">
          <ModalHead
            heading="Expenses"
            buttonLabel="ADD"
            onClick={() => {}}
            buttonProps={{}}
            onClose={onClose}
            onlyHeading
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Button
              variant="contained"
              onClick={() => router.push(`/admin/${companyId}/transactions/create?codBoardId=${boardData.id}&codDate=${boardData.date}`)}
            >
              + New Expense
            </Button>
          </Box>

          {expenses.length > 0 ? (
            <TransactionsTable
              transactions={expenses}
              showNotification={showNotification}
              handleUpdateStatus={handleUpdateStatus}
            />
          ) : (
            <ErrorComponent errorText="No Transactions Found" />
          )}

          <Box display="flex" justifyContent="flex-end" mt={3}>
            Total: ${totalAmount}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
