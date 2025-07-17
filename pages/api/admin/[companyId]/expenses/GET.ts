import { generateListOfDateString, generateMonthRange } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { TRANSACTION_STATUS, VIEW_TYPE } from '@/app/utils/enum';
import {
  formatDate,
  getLastMonthListOfDateString,
  sortExpenseByDate,
} from '@/pages/api/utils/date';
import prisma from '@/client';
import moment from 'moment';

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

    if (type && type === VIEW_TYPE.VENDOR) {
      expenses = await getExpenseWithVendorId(Number(id), {
        date: {
          in: listOfDateString,
        },
      });
      // const vendor = await prisma.vendor.findUnique({
      //   where: {
      //     id: Number(id),
      //   },
      //   include: {
      //     expense: {
      //       where: {
      //         expense: {
      //           date: {
      //             in: listOfDateString,
      //           },
      //         },
      //       },
      //       include: {
      //         expense: {
      //           include: {
      //             paymentMethod: true,
      //             vendors: {
      //               include: {
      //                 vendor: true,
      //               },
      //             },
      //             orderedItems: {
      //               include: {
      //                 inventoryUnit: true,
      //                 fifo: {
      //                   select: {
      //                     _count: {
      //                       select: {
      //                         orderedItems: true,
      //                       },
      //                     },
      //                   },
      //                 },
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      // });

      // if (!vendor) {
      //   return res.status(404).json({ error: 'Vendor not found' });
      // }

      // expenses = vendor.expense.map((expense: any) => expense.expense);
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

    const totalSpent = sortedExpensesByDate.reduce((acc: any, expense: any) => {
      return acc + expense.amount;
    }, 0);

    const unpaidExpenses = sortedExpensesByDate.filter(
      (expense: any) => expense.status === TRANSACTION_STATUS.UNPAID,
    );

    const unpaidAmount = unpaidExpenses.reduce((acc: any, expense: any) => {
      return acc + expense.amount;
    }, 0);

    const paidExpenses = sortedExpensesByDate.filter(
      (expense: any) => expense.status === TRANSACTION_STATUS.PAID,
    );

    const paidAmount = paidExpenses.reduce((acc: any, expense: any) => {
      return acc + expense.amount;
    }, 0);

    const monthRange = generateMonthRange();
    const currentMonthListOfDateString = generateListOfDateString(
      monthRange[0],
      monthRange[1],
    );
    const overdueExpenses = await getExpenseWithVendorId(Number(id), {
      status: TRANSACTION_STATUS.UNPAID,
      date: {
        notIn: currentMonthListOfDateString,
      },
    });

    const overdueAmount = overdueExpenses.reduce((acc: any, expense: any) => {
      return acc + expense.amount;
    }, 0);

    const sortedOverdueExpenses = sortExpenseByDate(overdueExpenses);

    // Top spending items
    const topSpendingItems = getTopSpendingItems(sortedExpensesByDate);

    // Payment delays
    const paymentDelays = getPaymentDelays(sortedExpensesByDate);

    // Compare with last month
    const lastMonthExpenses = await getLastMonthExpenses(
      Number(companyId),
      formattedStartDate,
    );

    const overview = {
      totalSpent,
      unpaidAmount,
      unpaidPercentage:
        Math.round((unpaidAmount / totalSpent) * 100 * 100) / 100,
      unpaidExpenses: unpaidExpenses.length,
      paidExpenses: paidExpenses.length,
      paidAmount,
      paidPercentage: Math.round((paidAmount / totalSpent) * 100 * 100) / 100,
      overdueExpenses: sortedOverdueExpenses,
      overdueAmount,
      topSpendingItems: topSpendingItems.sortedTopSpendingItems,
      avgPaymentDelay: paymentDelays.avgPaymentDelay,
      longestPaymentDelay: paymentDelays.longestPaymentDelay,
      shortestPaymentDelay: paymentDelays.shortestPaymentDelay,
      lastMonthExpenses: lastMonthExpenses.totalSpent,
      lastMonthExpensesPercentage:
        Math.round(
          (lastMonthExpenses.totalSpent / totalSpent) * 100 * 100,
        ) / 100,
      thisMonthExpensesPercentage:
        Math.round((totalSpent / lastMonthExpenses.totalSpent) * 100 * 100) /
        100,
    };

    return res.status(200).json({
      data: sortedExpensesByDate,
      chartData,
      overview,
      message: 'Fetch Expenses successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const getTransactions = async (condition: any) => {
  const prisma = new PrismaClient();

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

const getExpenseWithVendorId = async (vendorId: number, query: any) => {
  const vendor = await prisma.vendor.findUnique({
    where: {
      id: vendorId,
    },
    include: {
      expense: {
        where: {
          expense: query,
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

  if (!vendor || vendor?.expense?.length === 0) {
    return [];
  }

  return vendor?.expense.map((expense: any) => expense.expense);
};

const getTopSpendingItems = (expenses: any) => {
  const topSpendingItems = expenses.reduce((acc: any, expense: any) => {
    // const item = expense.orderedItems[0];
    // if (!acc[item.name]) {
    //   acc[item.name] = 0;
    // }
    // acc[item.name] += item.amount;

    for (const item of expense.orderedItems) {
      if (!acc[item.name]) {
        acc[item.name] = 0;
      }
      acc[item.name] += item.price * item.quantity;
    }

    return acc;
  }, {});

  const sortedTopSpendingItems = Object.entries(topSpendingItems)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  return {
    topSpendingItems,
    sortedTopSpendingItems,
  };
};

const getPaymentDelays = (expenses: any) => {
  // Map through expenses and calculate the payment delay for each expense
  const paymentDelays = expenses.map((expense: any) => {
    if (expense?.paidAt) {
      const paymentDelay = moment
        .utc(expense?.paidAt)
        .diff(moment.utc(expense?.date), 'days');

      return {
        ...expense,
        paymentDelay,
      };
    }

    return {
      ...expense,
      paymentDelay: 0,
    };
  });

  const avgPaymentDelay =
    paymentDelays.reduce((acc: any, expense: any) => {
      return acc + expense.paymentDelay;
    }, 0) / paymentDelays.length;

  const longestPaymentDelay = paymentDelays.reduce((acc: any, expense: any) => {
    return Math.max(acc, expense.paymentDelay);
  }, 0);

  const shortestPaymentDelay = paymentDelays.reduce(
    (acc: any, expense: any) => {
      return Math.min(acc, expense.paymentDelay);
    },
    Infinity,
  );

  return {
    paymentDelays,
    avgPaymentDelay,
    longestPaymentDelay,
    shortestPaymentDelay,
  };
};

const getLastMonthExpenses = async (companyId: number, startDate: any) => {
  const lastMonthListOfDateString =
    getLastMonthListOfDateString(startDate);

  const lastMonthExpenses = await getTransactions({
    date: {
      in: lastMonthListOfDateString,
    },
  });

  const totalSpent = lastMonthExpenses.reduce((acc: any, expense: any) => {
    return acc + expense.amount;
  }, 0);

  return {
    totalSpent,
    lastMonthExpenses,
  };
};