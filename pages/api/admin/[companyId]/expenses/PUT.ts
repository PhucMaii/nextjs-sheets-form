import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  description: string;
  date: string;
  paymentMethodId: number;
  amount: number;
  PST: number;
  GST: number;
  subTotal: number;
  discount?: number;
  status?: string;
  codBoardId?: number;
  frontFileKey?: string;
  frontFileType?: string;
  backFileKey?: string;
  backFileType?: string;
  typeId?: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      id,
      description,
      date,
      paymentMethodId,
      amount,
      PST,
      GST,
      subTotal,
      discount,
      status,
      codBoardId,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
      typeId,
    }: IBody = req.body;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: id,
      },
    });

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updatedExpense = await prisma.expense.update({
      where: {
        id: id,
      },
      data: {
        description: description,
        date: date,
        paymentMethodId,
        amount: amount,
        subTotal,
        PST,
        GST,
        discount,
        status,
        codBoardId,
        typeId,
      },
      include: {
        cheques: true,
      },
    });

    await updateCheque(
      updatedExpense,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
      createdBy,
    );

    return res.status(200).json({
      data: updatedExpense,
      message: 'Update Expense Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

export const updateCheque = async (
  expense: any,
  frontFileKey: string | null | undefined,
  frontFileType: string | null | undefined,
  backFileKey: string | null | undefined,
  backFileType: string | null | undefined,
  createdBy: string,
  isBatchTransaction: boolean = false,
) => {
  const today = getTodayDate();

  let queryExpense: any = {
    expenseId: expense.id,
  };
  if (isBatchTransaction) {
    queryExpense = {
      batchTransactionId: expense.id,
    };
  }

  // Check if front file key is provided for this expense
  if (frontFileKey && frontFileType) {
    // Check if front file key already exists for this expense
    const isFrontFileExists = expense?.cheques?.find(
      (cheque: any) => cheque?.note === 'front',
    );

    if (!isFrontFileExists || isFrontFileExists.fileKey !== frontFileKey) {
      // delete old front file in case of update
      await prisma.media.deleteMany({
        where: {
          ...queryExpense,
          note: 'front',
        },
      });

      await prisma.media.create({
        data: {
          type: frontFileType,
          fileKey: frontFileKey,
          ...queryExpense,
          createdBy: createdBy,
          createdAt: today.dateAndTime,
          note: 'front',
        },
      });
    }
  } else if (!frontFileKey && !frontFileType) {
    await prisma.media.deleteMany({
      where: {
        ...queryExpense,
        note: 'front',
      },
    });
  }

  // Check if back file key is provided for this expense
  if (backFileKey && backFileType) {
    // Check if back file key already exists for this expense
    const isBackFileExists = expense?.cheques?.find(
      (cheque: any) => cheque?.note === 'back',
    );

    if (!isBackFileExists || isBackFileExists.fileKey !== backFileKey) {
      // delete old back file in case of update
      await prisma.media.deleteMany({
        where: {
          ...queryExpense,
          note: 'back',
        },
      });

      await prisma.media.create({
        data: {
          type: backFileType,
          fileKey: backFileKey,
          ...queryExpense,
          createdBy: createdBy,
          createdAt: today.dateAndTime,
          note: 'back',
        },
      });
    }
  } else if (!backFileKey && !backFileType) {
    await prisma.media.deleteMany({
      where: {
        ...queryExpense,
        note: 'back',
      },
    });
  }

  return {
    ok: true,
    message: 'Update Cheque Successfully',
  };
};
