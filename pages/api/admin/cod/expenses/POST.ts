import { mainPaymentMethodId } from '@/app/lib/constant';
import { getUserInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  spentBy: string;
  codBoardId: number;
  createdAt: string;
  createdBy?: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      createdAt,
      createdBy,
      date,
      amount,
      description,
      paymentMethodId,
      spentBy,
      codBoardId,
    }: IBody = req.body;

    const existingBoard = await prisma.codBoard.findUnique({
      where: {
        id: codBoardId,
      },
      include: {
        expense: true,
      },
    });

    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!existingMethod) {
      return res.status(404).json({
        error: 'Payment Method Not Found',
      });
    }

    if (paymentMethodId !== mainPaymentMethodId) {
      return res.status(400).json({
        error: 'Payment Method Not Allowed',
      });
    }

    if (!existingBoard) {
      return res.status(404).json({
        error: 'Cod Board Not Found',
      });
    }

    if (existingBoard.expense.length > 0) {
      const updatedExpense = await prisma.expense.update({
        where: {
          id: existingBoard.expense[0].id,
        },
        data: {
          date,
          amount,
          description,
          paymentMethodId,
          spentBy,
          createdAt,
          createdBy,
        },
      });

      const newBalance =
        existingMethod.balance + amount - existingBoard.expense[0].amount;

      await prisma.paymentMethod.update({
        where: {
          id: paymentMethodId,
        },
        data: {
          balance: newBalance,
        },
      });

      return res.status(200).json({
        message: 'Expense Updated Successfully',
        data: updatedExpense,
      });
    }

    const user = await getUserInfo(req, res);

    const newExpense = await prisma.expense.create({
      data: {
        date,
        amount,
        description,
        paymentMethodId,
        spentBy,
        createdAt,
        createdBy: createdBy ? createdBy : `Admin - ${user?.clientName}`,
        codBoardId,
      },
    });

    const newBalance = existingMethod.balance + amount;

    await prisma.paymentMethod.update({
      where: {
        id: paymentMethodId,
      },
      data: {
        balance: newBalance,
      },
    });

    return res.status(200).json({
      message: 'Expense Created Successfully',
      data: newExpense,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
