import { YYYYMMDDFormat } from '@/app/utils/time';
import { RECURRENCE_TYPE, FIXED_TRANSACTION_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate, normalizeDate } from '../../utils/date';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization;
  console.log(authHeader, 'AUTH HEADER');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const todayDate = getTodayDate();
    const fixedTransactions = await prisma.fixedTransaction.findMany({
      where: {
        status: FIXED_TRANSACTION_STATUS.ACTIVE,
        nextDueDate: todayDate.date,
      },
    });

    for (const transaction of fixedTransactions) {
      // Create a new expense
      // const admin: any = await getUserInfo(req, res);
      await prisma.expense.create({
        data: {
          amount: transaction?.defaultAmount || 0,
          description: transaction.title,
          createdAt: todayDate.dateAndTime,
          createdBy: transaction?.defaultSpentBy || '',
          PST: transaction?.defaultPST || 0,
          GST: transaction?.defaultGST || 0,
          subTotal: transaction?.defaultSubtotal || 0,
          date: todayDate.date,
          spentBy: transaction?.defaultSpentBy || '',
          paymentMethodId: transaction.paymentMethodId,
          status: transaction.defaultTransactionStatus,
          discount: 0,
          fixedTransactionId: transaction.id,
        },
      });

      const nextDueDate = calculateNextDueDate(
        transaction.nextDueDate,
        transaction.recurrence as RECURRENCE_TYPE,
      );
      await prisma.fixedTransaction.update({
        where: { id: transaction.id },
        data: { nextDueDate },
      });
    }

    return res
      .status(200)
      .json({ message: 'Transactions created successfully' });
  } catch (error) {
    console.log(error, 'Internal Server Error');
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
