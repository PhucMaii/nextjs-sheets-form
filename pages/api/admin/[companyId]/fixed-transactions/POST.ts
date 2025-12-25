import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate, normalizeDate } from '@/pages/api/utils/date';
import { RECURRENCE_TYPE, FIXED_TRANSACTION_STATUS } from '@/app/utils/enum';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';
interface IBody {
  title: string;
  defaultAmount?: number;
  defaultSubtotal?: number;
  defaultPST?: number;
  defaultGST?: number;
  defaultSpentBy?: string;
  defaultTransactionStatus?: string;
  recurrence: RECURRENCE_TYPE;
  initialDueDate: string;
  note?: string;
  paymentMethodId: number;
  typeId?: number;
  hasStopped?: boolean;
  lastStopAt?: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      title,
      defaultAmount,
      defaultSubtotal,
      defaultPST,
      defaultGST,
      defaultSpentBy,
      defaultTransactionStatus,
      recurrence,
      initialDueDate,
      note,
      paymentMethodId,
      typeId,
    } = req.body as IBody;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (
      !title ||
      !recurrence ||
      !initialDueDate ||
      !paymentMethodId ||
      paymentMethodId === -1
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if initialDueDate is past
    const initialDueDateObj = normalizeDate(initialDueDate);
    const todayDate = getTodayDate();
    const todayObj = normalizeDate(todayDate.dateAndTime);
    if (initialDueDateObj.getTime() < todayObj.getTime()) {
      return res
        .status(400)
        .json({ error: 'Initial due date cannot be in the past' });
    }

    // Check if title is available
    const existingTransaction = await prisma.fixedTransaction.findFirst({
      where: {
        title,
        status: {
          not: FIXED_TRANSACTION_STATUS.ARCHIVED,
        },
        companyId: Number(companyId),
      },
    });

    if (existingTransaction) {
      return res
        .status(400)
        .json({ error: 'Transaction title already exists' });
    }

    const today = getTodayDate();
    const session: any = await getServerSession(req, res, authOptions);
    const admin: any = session?.user;

    // Calculate next due date
    // const nextDueDate = calculateNextDueDate(initialDueDate, recurrence);

    const newTransaction = await prisma.fixedTransaction.create({
      data: {
        title,
        defaultAmount,
        defaultSubtotal,
        defaultPST,
        defaultGST,
        defaultSpentBy,
        defaultTransactionStatus,
        recurrence,
        initialDueDate,
        nextDueDate: initialDueDate,
        note,
        status: FIXED_TRANSACTION_STATUS.ACTIVE,
        createdAt: today.dateAndTime,
        createdBy: `Admin - ${admin?.clientName}`,
        paymentMethodId: paymentMethodId,
        companyId: Number(companyId),
        typeId: typeId || -1,
      },
    });

    return res.status(200).json({
      message: 'Transaction created successfully',
      data: newTransaction,
    });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
