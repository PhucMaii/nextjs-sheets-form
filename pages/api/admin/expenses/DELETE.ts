import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Expense Id Not Provided',
      });
    }

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        error: 'Expense Not Found',
      });
    }

    await prisma.expense.delete({
      where: {
        id: Number(id),
      },
    });

    // Update payment method balance
    await prisma.paymentMethod.update({
      where: {
        id: existingExpense.paymentMethodId,
      },
      data: {
        balance: {
          decrement: existingExpense.amount,
        },
      },
    });

    return res.status(200).json({
      message: 'Expense Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
