import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { startDate, endDate, companyId }: IQuery = req.query;

    if (!startDate || !endDate || !companyId) {
      return res.status(404).json({
        error: 'Missing required parameters',
      });
    }

    const normalizedStartDate = normalizeDate(new Date(startDate));
    const normalizedEndDate = normalizeDate(new Date(endDate));

    const listOfDateString = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          in: listOfDateString,
        },
        orderedItems: {
          some: {}, // Ensures there is at least one ordered item
        },
        companyId: Number(companyId),
      },
      include: {
        paymentMethod: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
        orderedItems: {
          include: {
            inventoryUnit: true,
            fifo: {
              select: {
                _count: {
                  select: {
                    orderedItems: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: expenses,
      message: 'Fetch Expenses successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
