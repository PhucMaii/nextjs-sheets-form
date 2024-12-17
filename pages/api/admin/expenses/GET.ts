import { generateListOfDateString } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate, sortExpenseByDate } from '../../utils/date';
import { VIEW_TYPE } from '@/app/utils/enum';

interface IQuery {
  startDate?: string;
  endDate?: string;
  id?: string;
  type?: VIEW_TYPE;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { startDate, endDate, id, type }: IQuery = req.query;

    if (!startDate || !endDate) {
      return res.status(404).json({ error: 'Missing required parameters' });
    }

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    if (!id || Number(id) <= 0) {
      const expenses = await prisma.expense.findMany({
        where: {
          date: {
            in: listOfDateString,
          },
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
                include: {
                  orderedItems: true,
                },
              },
            },
          },
        },
      });

      const sortedExpensesByDate = sortExpenseByDate(expenses);

      const transactionBasedOnDate = sortedExpensesByDate.reduce(
        (acc: any, expense: any) => {
          if (!acc[expense.date]) {
            acc[expense.date] = 0;
          }
  
          acc[expense.date] += expense.amount;
          return acc;
        },
        {},
      );
      const chartData = generateChartDataForm(
        transactionBasedOnDate,
        listOfDateString,
      );

      return res.status(200).json({
        data: sortedExpensesByDate,
        chartData,
        message: 'Fetch Expenses successfully',
      });
    }

    let expenses = await prisma.expense.findMany({
      where: {
        date: {
          in: listOfDateString,
        },
        paymentMethodId: Number(id),
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
              include: {
                orderedItems: true,
              },
            },
          },
        },
      },
    });

    if (type && type === VIEW_TYPE.VENDOR) {
      const vendor = await prisma.vendor.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          expense: {
            where: {
              expense: {
                date: {
                  in: listOfDateString,
                },
              },
            },
            include: {
              expense: {
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
                        include: {
                          orderedItems: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      expenses = vendor.expense.map((expense: any) => expense.expense);
      console.log(expenses, 'expenses');
    }

    const sortedExpensesByDate = sortExpenseByDate(expenses);

    const transactionBasedOnDate = sortedExpensesByDate.reduce(
      (acc: any, expense: any) => {
        if (!acc[expense.date]) {
          acc[expense.date] = 0;
        }

        acc[expense.date] += expense.amount;
        return acc;
      },
      {},
    );
    const chartData = generateChartDataForm(
      transactionBasedOnDate,
      listOfDateString,
    );

    return res.status(200).json({
      data: sortedExpensesByDate,
      chartData,
      message: 'Fetch Expenses successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const generateChartDataForm = (
  transactionBasedOnDate: any,
  listOfDateString: any,
) => {
  if (
    !transactionBasedOnDate ||
    Object.keys(transactionBasedOnDate).length === 0
  ) {
    return [];
  }

  const returnData = [];

  let dateIndex = 0;

  while (dateIndex < listOfDateString.length) {
    const date = listOfDateString[dateIndex];
    const transaction = transactionBasedOnDate[date];

    if (!transaction) {
      returnData.push(0);
    } else {
      returnData.push(transaction);
    }

    dateIndex++;
  }

  return returnData;
};
