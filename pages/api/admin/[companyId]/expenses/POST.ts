import { NextApiRequest, NextApiResponse } from 'next';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';

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
  discount?: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
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
      discount,
    }: IBody = req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const session: any = await getServerSession(req, res, authOptions);
    const adminUser: any = session?.user;

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
        discount,
        companyId: Number(companyId),
      },
    });

    // const newBalance = existingMethod.balance + amount;

    // await prisma.paymentMethod.update({
    //   where: {
    //     id: paymentMethodId,
    //   },
    //   data: {
    //     balance: newBalance,
    //   },
    // });

    return res.status(201).json({
      data: newExpense,
      message: 'Create New Expense Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
