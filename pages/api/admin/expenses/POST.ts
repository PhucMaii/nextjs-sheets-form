import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import { TRANSACTION_STATUS } from '@/app/utils/enum';

interface IBody {
  amount: number;
  PST: number;
  GST: number;
  subTotal: number;
  description: string;
  createdAt: string;
  spentBy: string;
  date: string;
  paymentMethodId: number;
  status: TRANSACTION_STATUS;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      createdAt,
      amount,
      PST,
      GST,
      subTotal,
      description,
      date,
      spentBy,
      paymentMethodId,
      status,
    }: IBody = req.body;

    const adminUser = await getUserInfo(req, res);

    if (!adminUser) {
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
        amount,
        description,
        createdAt,
        createdBy: `Admin - ${adminUser.clientName}`,
        PST,
        GST,
        subTotal,
        date,
        spentBy,
        paymentMethodId,
        status,
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

    return res.status(201).json({
      data: newExpense,
      message: 'Create New Expense Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
