import { PrismaClient } from '@prisma/client';
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
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

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
    }: IBody = req.body;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: id,
      },
    });

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
      },
    });

    const paymentMethod: any = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    // Update payment method balance
    if (amount !== existingExpense.amount) {
      const newBalance =
        paymentMethod.balance + amount - existingExpense.amount;

      await prisma.paymentMethod.update({
        where: {
          id: paymentMethodId,
        },
        data: {
          balance: newBalance,
        },
      });
    }

    return res.status(200).json({
      data: updatedExpense,
      message: 'Update Expense Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
