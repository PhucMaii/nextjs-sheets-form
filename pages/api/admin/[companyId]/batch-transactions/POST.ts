import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { Expense } from '@prisma/client';
import { IBatchTransaction } from '@/app/utils/type';
import { getTodayDate } from '@/pages/api/utils/date';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { TRANSACTION_STATUS, USER_ROLE } from '@/app/utils/enum';
import { updateCheque } from '../expenses/PUT';

interface IBody {
  batchTransaction: IBatchTransaction;
  smallExpenses: Expense[] | any[];
  frontFileKey?: string;
  frontFileType?: string;
  backFileKey?: string;
  backFileType?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const {
      batchTransaction,
      smallExpenses,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
    } = req.body as IBody;

    const createdAt = getTodayDate().dateAndTime;
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    const createdBatchTransaction = await prisma.batchTransaction.create({
      data: {
        date: batchTransaction.date,
        startDate: batchTransaction.startDate,
        endDate: batchTransaction.endDate,
        discount: batchTransaction.discount,
        subTotal: batchTransaction.subTotal,
        total: batchTransaction.total,
        PST: batchTransaction.PST,
        GST: batchTransaction.GST,
        spentBy: batchTransaction.spentBy,
        paymentMethodId: batchTransaction.paymentMethodId,
        createdBy: createdBy,
        createdAt: createdAt,
        description: batchTransaction.description,
        companyId: Number(companyId),
        status: batchTransaction.status,
        typeId: batchTransaction?.typeId,
      },
    });

    // Create small expenses
    await prisma.expense.createMany({
      data: smallExpenses.map((expense) => ({
        date: expense.date,
        description: `Small Expense for Batch Transaction #${createdBatchTransaction.id}`,
        spentBy: createdBatchTransaction.spentBy,
        createdBy: createdBy,
        createdAt: createdAt,
        PST: expense?.PST || 0,
        GST: expense?.GST || 0,
        amount: expense.total,
        discount: 0,
        subTotal: expense?.subTotal || 0,
        companyId: Number(companyId),
        paymentMethodId: createdBatchTransaction?.paymentMethodId || 0,
        batchTransactionId: createdBatchTransaction.id,
        typeId: createdBatchTransaction?.typeId || 0,
        status: createdBatchTransaction?.status || TRANSACTION_STATUS.UNPAID,
      })),
    });

    await updateCheque(
      createdBatchTransaction,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
      createdBy,
      true,
    );

    res.status(201).json({
      message: 'Batch transaction created successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    res
      .status(500)
      .json({ error: 'Fail to create batch transactions: ' + error });
  }
};

export default handler;
