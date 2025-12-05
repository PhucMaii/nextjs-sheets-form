import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { EvidenceType } from '@prisma/client';
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
  billFileKey?: string;
  billFileType?: string;
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
      billFileKey,
      billFileType,
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
        medias: true,
      },
    });

    if (billFileKey && billFileType) {
      await updateBill(updatedExpense, billFileKey, billFileType, createdBy);
    }

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

export const updateBill = async (
  expense: any,
  billFileKey: string,
  billFileType: string,
  createdBy: string,
) => {
  const today = getTodayDate();

  await prisma.$transaction(async (tx) => {
    // Check if expense has bill file key yet
    if (expense?.medias && expense?.medias?.length > 0) {
      const isBillFileExists = expense.medias?.find(
        (media: any) => media.evidenceType === EvidenceType.BILL,
      );

      if (isBillFileExists) {
        // Delete the old bill file
        await tx.media.deleteMany({
          where: {
            expenseId: expense.id,
            evidenceType: EvidenceType.BILL,
          },
        });
      }
    }

    // Create new bill file
    await tx.media.create({
      data: {
        type: billFileType || '',
        fileKey: billFileKey || '',
        expenseId: expense.id,
        evidenceType: EvidenceType.BILL,
        createdAt: today.dateAndTime,
        createdBy: createdBy,
      },
    });
  });

  return {
    ok: true,
    message: 'Update Bill Successfully',
  };
};

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
    const isFrontFileExists = expense?.medias?.find(
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
          companyId: expense.companyId,
          createdBy: createdBy,
          createdAt: today.dateAndTime,
          note: 'front',
          evidenceType: EvidenceType.CHEQUE,
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
    const isBackFileExists = expense?.medias?.find(
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
          companyId: expense.companyId,
          evidenceType: EvidenceType.CHEQUE,
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
