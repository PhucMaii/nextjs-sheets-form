import { Expense, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (id) {
      const method = await prisma.paymentMethod.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          transactions: true,
        }
      });
      return res.status(200).json({
        data: method,
        message: 'Fetch Payment Methods Successfully',
      });
    }
    
    const allMethods = await prisma.paymentMethod.findMany({
      include: {
        transactions: true,
      }
    });

    // Get who used it most
    const mostUsedMethod: any = {};
    for (const method of allMethods) {
      if (method.transactions.length === 0) {
        continue;
      }

      const mostUsed = method.transactions.reduce((acc: any, transaction: Expense) => {
        if (!acc[transaction.spentBy]) {
          acc[transaction.spentBy] = {amount: transaction.amount, count: 1};
          return acc;
        }

        acc[transaction.spentBy].amount += transaction.amount;
        acc[transaction.spentBy].count += 1;
        return acc;
      }, {});

      mostUsedMethod[method.id] = mostUsed;
    }

    return res.status(200).json({
      data: allMethods,
      mostUsedMethod,
      message: 'Fetch Payment Method Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
