import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../../utils/auth';

interface IBody {
  amount: number;
  date: string;
  paymentMethodId: number;
  description: string;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { amount, date, paymentMethodId, description, createdAt }: IBody =
      req.body;

    const driver = await getDriverInfo(req, res);

    if (!driver) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

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

    const newExpense = await prisma.expense.create({
      data: {
        amount: amount,
        date: date,
        paymentMethodId: paymentMethodId,
        description: description,
        createdAt,
        spentBy: `Driver - ${driver?.name}`,
        createdBy: `Driver - ${driver?.name}`,
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

    return res
      .status(200)
      .json({ data: newExpense, message: 'Add Expense Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
