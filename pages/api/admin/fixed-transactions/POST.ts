import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate, normalizeDate } from '../../utils/date';
import { getUserInfo } from '../../utils/auth';
import { FIXED_TRANSACTION_STATUS, RECURRENCE_TYPE } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';

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
}

const prisma = new PrismaClient();

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
    } = req.body as IBody;

    if (!title || !recurrence || !initialDueDate || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if title is available
    const existingTransaction = await prisma.fixedTransaction.findFirst({
      where: {
        title,
      },
    });

    if (existingTransaction) {
      return res
        .status(400)
        .json({ error: 'Transaction title already exists' });
    }

    const today = getTodayDate();
    const admin: any = await getUserInfo(req, res);

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(initialDueDate, recurrence);

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
        nextDueDate,
        note,
        status: FIXED_TRANSACTION_STATUS.ACTIVE,
        createdAt: today.dateAndTime,
        createdBy: `Admin - ${admin?.clientName}`,
        paymentMethodId: paymentMethodId,
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

export const calculateNextDueDate = (
  initialDueDate: string,
  recurrence: RECURRENCE_TYPE,
) => {
  const recurrenceMap = {
    [RECURRENCE_TYPE.DAILY]: 1,
    [RECURRENCE_TYPE.WEEKLY]: 7,
    [RECURRENCE_TYPE.BI_WEEKLY]: 14,
    [RECURRENCE_TYPE.MONTHLY]: 30,
    [RECURRENCE_TYPE.YEARLY]: 365,
  };

  const initialDueDateObj = normalizeDate(initialDueDate);
  const nextDueDateObj = new Date(initialDueDateObj);
  nextDueDateObj.setDate(nextDueDateObj.getDate() + recurrenceMap[recurrence]);

  const nextDueDateString = YYYYMMDDFormat(nextDueDateObj);
  console.log(
    { nextDueDateObj, initialDueDateObj, nextDueDateString },
    'nextDueDateObj',
  );
  return nextDueDateString;
};
