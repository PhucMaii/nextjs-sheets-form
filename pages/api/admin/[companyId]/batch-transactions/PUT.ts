import prisma from '@/client';
import { PaymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { updateCheque } from '../expenses/PUT';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';

interface IBody {
  id: number;
  total: number;
  subTotal: number;
  discount: number;
  GST: number;
  PST: number;
  spentBy: string;
  date: string;
  paymentMethodId: number;
  status: string;
  description: string;
  startDate: string;
  endDate: string;
  smallExpenses: any[];
  frontFileKey?: string;
  frontFileType?: string;
  backFileKey?: string;
  backFileType?: string;
  typeId?: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      id,
      total,
      subTotal,
      discount,
      GST,
      PST,
      spentBy,
      date,
      paymentMethodId,
      status,
      description,
      startDate,
      endDate,
      smallExpenses,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
      typeId,
    }: IBody = req.body;

    const existingBatchTransaction = await prisma.batchTransaction.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingBatchTransaction) {
      return res.status(404).json({ error: 'Batch Transaction Not Found' });
    }

    // Update Batch Transaction
    const updatedBatchTransaction = await prisma.batchTransaction.update({
      where: { id: Number(id) },
      data: {
        total,
        subTotal,
        discount,
        GST,
        PST,
        spentBy,
        date,
        paymentMethodId,
        status: status as PaymentStatus,
        description,
        startDate,
        endDate,
        typeId,
      },
      include: {
        transactions: true,
        cheques: true,
      },
    });

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    await updateCheque(
      updatedBatchTransaction,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
      createdBy,
      true,
    );

    // Update Small Expenses
    const newSmallExpenses = [];
    for (const expense of smallExpenses) {
      const existingSmallExpense = updatedBatchTransaction.transactions.find(
        (e: any) => e.id === expense.id,
      );

      // New Small Expense
      if (!existingSmallExpense) {
        newSmallExpenses.push({...expense, typeId: updatedBatchTransaction?.typeId});
        continue;
      }

      // Check if there is any change in the small expense
      if (
        existingSmallExpense.amount !== expense.amount ||
        existingSmallExpense.subTotal !== expense.subTotal ||
        existingBatchTransaction?.typeId !== updatedBatchTransaction?.typeId
      ) {
        await prisma.expense.update({
          where: { id: existingSmallExpense.id },
          data: {
            amount: expense.amount,
            subTotal: expense.subTotal,
            GST: expense?.GST || 0,
            PST: expense?.PST || 0,
            typeId: updatedBatchTransaction?.typeId,
          },
        });
      }
    }

    // To Delete Small Expenses
    const smallExpensesToDelete = updatedBatchTransaction.transactions.filter(
      (expense: any) => !smallExpenses.some((e) => e.id === expense.id),
    );

    if (smallExpensesToDelete.length > 0) {
      await prisma.expense.deleteMany({
        where: {
          id: { in: smallExpensesToDelete.map((e) => e.id) },
        },
      });
    }

    return res
      .status(200)
      .json({ message: 'Batch Transaction Updated Successfully' });
  } catch (error: any) {
    console.error('Error updating batch transaction:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export default withAdminAuthGuard(handler);
