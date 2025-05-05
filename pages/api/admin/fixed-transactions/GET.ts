import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import { FIXED_TRANSACTION_STATUS } from '@/app/utils/enum';

interface IQuery {
  startDate?: string;
  endDate?: string;
}

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate } = req.query as IQuery;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const normalizedStartDate = normalizeDate(new Date(startDate));
    const normalizedEndDate = normalizeDate(new Date(endDate));

    const listOfDates = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    console.log({
      normalizedStartDate,
      normalizedEndDate,
      listOfDates,
      startDate,
      endDate,
    });

    // Get fixed transactions that have either initialDueDate or nextDueDate in the list of dates
    const fixedTransactions = await prisma.fixedTransaction.findMany({
      where: {
        OR: [
          { initialDueDate: { in: listOfDates } },
          { nextDueDate: { in: listOfDates } },
        ],
        status: {
          not: FIXED_TRANSACTION_STATUS.ARCHIVED,
        },
      },
    });

    const alreadyTransactions = await prisma.expense.findMany({
      where: {
        fixedTransactionId: { not: null },
        date: {
          in: listOfDates,
        },
      },
    });

    return res.status(200).json({
      message: 'Fixed transactions fetched successfully',
      data: { fixedTransactions, transactions: alreadyTransactions },
    });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
