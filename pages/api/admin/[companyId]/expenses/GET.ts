import { generateListOfDateString } from '@/app/utils/time';
import { NextApiRequest, NextApiResponse } from 'next';
import { VIEW_TYPE } from '@/app/utils/enum';
import { formatDate, sortExpenseByDate } from '@/pages/api/utils/date';
import prisma from '@/client';

interface IQuery {
  startDate?: string;
  endDate?: string;
  id?: string;
  type?: VIEW_TYPE;
  companyId?: string;
}

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate, id, type, companyId }: IQuery = req.query;

    if (!startDate || !endDate || !companyId) {
      return res.status(404).json({ error: 'Missing required parameters' });
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    console.log({
      startDate,
      endDate,
      formattedStartDate,
      formattedEndDate,
    });

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    // console.log(listOfDateString, 'listOfDateString');

    if (!id || Number(id) <= 0) {
      const expenses = await prisma.expense.findMany({
        where: {
          date: {
            in: listOfDateString,
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

    let expenses = [];
    if (id) {
      expenses = await getTransactions({
        date: {
          in: listOfDateString,
        },
        paymentMethodId: Number(id),
      });
    }

    // let expenses = await prisma.expense.findMany({
    //   where: {
    //     date: {
    //       in: listOfDateString,
    //     },
    //     paymentMethodId: Number(id),
    //   },
    //   include: {
    //     paymentMethod: true,
    //     vendors: {
    //       include: {
    //         vendor: true,
    //       },
    //     },
    //     orderedItems: {
    //       include: {
    //         inventoryUnit: true,
    //         fifo: {
    //           select: {
    //             _count: {
    //               select: {
    //                 orderedItems: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

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
              },
            },
          },
        },
      });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      expenses = vendor.expense.map((expense: any) => expense.expense);
    } else if (type && type === VIEW_TYPE.STOCK_PURCHASED) {
      const stockPurchased = await getTransactions({
        date: {
          in: listOfDateString,
        },
        orderedItems: {
          some: {},
        },
        companyId: Number(companyId),
      });

      expenses = [...stockPurchased];
    } else if (type && type === VIEW_TYPE.CUSTOM_PURCHASED) {
      const stockPurchased = await getTransactions({
        date: {
          in: listOfDateString,
        },
        orderedItems: {
          none: {},
        },
        vendors: {
          none: {},
        },
        companyId: Number(companyId),
      });

      expenses = [...stockPurchased];
    } else if (type && type === VIEW_TYPE.FIXED_TRANSACTION) {
      const fixedTransaction = await getTransactions({
        date: {
          in: listOfDateString,
        },
        fixedTransactionId: {
          not: null,
        },
      });

      expenses = [...fixedTransaction];
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

const getTransactions = async (condition: any) => {
  const res = await prisma.expense.findMany({
    where: condition,
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

  return res;
};

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
