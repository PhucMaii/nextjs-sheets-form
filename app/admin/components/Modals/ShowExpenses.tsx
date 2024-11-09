import { AlertColor, Box, Button, Divider, Modal } from '@mui/material'
import React, { useMemo, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import { IExpense } from '@/app/utils/type';
import TransactionsTable from '../Tables/TransactionsTable';
import AddExpense from './add/AddExpense';

interface IProps extends ModalProps {
    expenses: IExpense[];
    showNotification: (type: AlertColor, message: string) => void;
    boardData: any;
}

export default function ShowExpenses({open, onClose, expenses, showNotification, boardData}: IProps) {
    const [isOpenAddExpense, setIsOpenAddExpense] = useState<boolean>(false);
    
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
        <AddExpense
            open={isOpenAddExpense}
            onClose={() => setIsOpenAddExpense(false)}
            showNotification={showNotification}
            // handleAddExpenseId={handleAddExpenseId}
            defaultValue={{
              date: boardData.date,
              spentBy: `Driver - ${boardData.driver.name}`,
            }}
            codBoardId={boardData.id}
        />
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading="Expenses"
                buttonLabel="ADD"
                onClick={() => {}}
                buttonProps={{}}
                onClose={onClose}
                onlyHeading
            />

            <Divider sx={{my: 2}} />

            <Box display="flex" justifyContent="flex-end" alignItems="center">
                <Button variant="contained" onClick={() => setIsOpenAddExpense(true)}>+ New Expense</Button>
            </Box>

            <TransactionsTable 
                transactions={expenses}
            />

            <Box display="flex" justifyContent="flex-end" mt={3}>
                Total: {totalAmount}
            </Box>
        </BoxModal>
    </Modal>
    </>
  )
}
