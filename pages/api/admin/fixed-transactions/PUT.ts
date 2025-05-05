import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateNextDueDate } from './POST';

interface IBody {
  id: number;
  updatedTransaction: any;
}

const prisma = new PrismaClient();

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, updatedTransaction } = req.body as IBody;

    const existingFixedTransaction = await prisma.fixedTransaction.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingFixedTransaction) {
      return res.status(404).json({
        error: 'Fixed transaction not found',
      });
    }

    // if (existingFixedTransaction.recurrence !== updatedTransaction.recurrence) {
    //     const newNextDueDate = calculateNextDueDate(updatedTransaction.recurrence, existingFixedTransaction.nextDueDate);
    // }
    const updatedFixedTransaction = await prisma.fixedTransaction.update({
      where: {
        id: id,
      },
      data: updatedTransaction,
    });

    return res.status(200).json({
      message: 'Fixed transaction updated successfully',
      data: updatedFixedTransaction,
    });
  } catch (error: any) {
    console.log('Internal server error', error);
    return res.status(500).json({
      error: 'Internal server error: ' + error,
    });
  }
}
