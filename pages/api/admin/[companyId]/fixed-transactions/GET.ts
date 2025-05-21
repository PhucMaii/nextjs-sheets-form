import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import { FIXED_TRANSACTION_STATUS } from '@/app/utils/enum';

interface IQuery {
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate, companyId } = req.query as IQuery;

    if (!startDate || !endDate || !companyId) {
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
        nextDueDate: { in: listOfDates },
        status: {
          not: FIXED_TRANSACTION_STATUS.ARCHIVED,
        },
        companyId: Number(companyId),
      },
    });

    const alreadyTransactions = await prisma.expense.findMany({
      where: {
        fixedTransactionId: { not: null },
        date: {
          in: listOfDates,
        },
        companyId: Number(companyId),
      },
      include: {
        fixedTransaction: true,
      },
    });

    if (fixedTransactions.length === 0 && alreadyTransactions.length === 0) {
      return res.status(200).json({
        message: 'No fixed transactions or transactions found',
        data: {
          fixedTransactions: [],
          transactions: [],
          overview: {
            totalFixedTransactions: 0,
            totalTransactions: 0,
            totalAmount: 0,
            numberOfFixedTransactions: 0,
            percentageOfExpenses: 0,
          },
        },
      });
    }

    // Overview calculation
    const totalFixedTransactions =
      fixedTransactions.reduce(
        (acc, transaction) => acc + (transaction?.defaultAmount || 0),
        0,
      ) || 0;
    const totalTransactions =
      alreadyTransactions.reduce(
        (acc, transaction) => acc + (transaction?.amount || 0),
        0,
      ) || 0;
    const totalAmount = totalFixedTransactions + totalTransactions;

    // % Takes in Expenses
    const expensesInRange = await prisma.expense.findMany({
      where: {
        date: {
          in: listOfDates,
        },
      },
    });

    const totalExpenses =
      expensesInRange.reduce(
        (acc, expense) => acc + (expense?.amount || 0),
        0,
      ) || 0;
    const percentageOfExpenses = (totalAmount / totalExpenses) * 100;

    return res.status(200).json({
      message: 'Fixed transactions fetched successfully',
      data: {
        fixedTransactions,
        transactions: alreadyTransactions,
        overview: {
          totalFixedTransactions,
          totalTransactions,
          totalAmount,
          numberOfFixedTransactions:
            fixedTransactions?.length + alreadyTransactions?.length,
          percentageOfExpenses,
        },
      },
    });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
