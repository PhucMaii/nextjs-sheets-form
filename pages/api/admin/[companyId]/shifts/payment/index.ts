import { SHIFT_STATUS } from '@/app/utils/enum';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { newExpense, shifts } = req.body;

    if (!newExpense) {
      return res.status(400).json({ error: 'Missing newExpense data' });
    }

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }

    const today = getTodayDate();

    const session: any = await getServerSession(req, res, authOptions);
    const admin: any = session?.user;

    // First create the epxense
    const expense = await prisma.expense.create({
      data: {
        amount: newExpense.amount,
        date: newExpense.date,
        description: newExpense.description,
        paymentMethodId: newExpense.paymentMethodId,
        status: newExpense.status,
        PST: newExpense.PST,
        GST: newExpense.GST,
        subTotal: newExpense.subTotal,
        spentBy: newExpense.spentBy,
        createdAt: today.dateAndTime,
        createdBy: `Admin - ${admin.name}`,
        companyId: Number(companyId),
      },
    });

    // Convert the shifts to paid
    await prisma.shiftSession.updateMany({
      where: {
        id: {
          in: shifts.map((shift: any) => shift.id),
        },
      },
      data: {
        status: SHIFT_STATUS.PAID,
        expenseId: expense.id,
      },
    });

    return res.status(200).json({
      message: 'Payment added successfully',
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default withAdminAuthGuard(handler);
