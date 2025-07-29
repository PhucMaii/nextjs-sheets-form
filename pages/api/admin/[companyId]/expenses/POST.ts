import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { TRANSACTION_STATUS, USER_ROLE } from '@/app/utils/enum';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getTodayDate } from '@/pages/api/utils/date';
import { updateCheque } from './PUT';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';

interface IBody {
  amount: number;
  PST: number;
  GST: number;
  subTotal: number;
  description: string;
  spentBy: string;
  date: string;
  paymentMethodId: number;
  status: TRANSACTION_STATUS;
  discount?: number;
  codBoardId?: number;
  frontFileKey?: string;
  frontFileType?: string;
  backFileKey?: string;
  backFileType?: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
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
      codBoardId,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
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

    const createdAt = getTodayDate().dateAndTime;
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    const newExpense = await prisma.expense.create({
      data: {
        amount,
        description,
        createdAt,
        createdBy,
        PST,
        GST,
        subTotal,
        date,
        spentBy,
        paymentMethodId,
        status,
        discount,
        companyId: Number(companyId),
        codBoardId,
      },
    });

    await updateCheque(
      newExpense,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
      createdBy,
    );

    return res.status(201).json({
      data: newExpense,
      message: 'Create New Expense Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
