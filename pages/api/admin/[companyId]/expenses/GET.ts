import { generateListOfDateString, generateMonthRange } from '@/app/utils/time';
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
  type?: VIEW_TYPE | string; // could be 'stockPurchased', 'other', 'batch'
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

    if (!companyId) {
      return res.status(404).json({ error: 'Missing required parameters' });
    }

    const formattedStartDate = formatDate(startDate || '');
    const formattedEndDate = formatDate(endDate || '');

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    // Fetch all expenses for the date range
    if (!id || Number(id) <= 0) {
      const expenses = await getTransactions(
        {
          date: {
            in: listOfDateString,
          },
          companyId: Number(companyId),
        },
        true,
      );

      return res.status(200).json({
        data: expenses.expenses,
        chartData: expenses.chartData,
        message: 'Fetch Expenses successfully',
      });
    }

    if (type && type === VIEW_TYPE.VENDOR) {
      const expenses = await getExpenseWithVendorId(
        Number(id),
        {
          date: {
            in: listOfDateString,
          },
        },
        true,
      );

      const sortedExpensesByDate = expenses.expenses;

      const totalSpent = sortedExpensesByDate.reduce(
        (acc: any, expense: any) => {
          return acc + expense?.amount || expense?.total;
        },
        0,
      );

      const unpaidExpenses = sortedExpensesByDate.filter(
        (expense: any) => expense.status === TRANSACTION_STATUS.UNPAID,
      );

      const unpaidAmount = unpaidExpenses.reduce((acc: any, expense: any) => {
        return acc + expense?.amount || expense?.total;
      }, 0);

      const paidExpenses = sortedExpensesByDate.filter(
        (expense: any) => expense.status === TRANSACTION_STATUS.PAID,
      );

      const paidAmount = paidExpenses.reduce((acc: any, expense: any) => {
        return acc + expense?.amount || expense?.total;
      }, 0);

      const monthRange = generateMonthRange();
      const currentMonthListOfDateString = generateListOfDateString(
        monthRange[0],
        monthRange[1],
      );
      const overdueExpensesFromVendor = await getExpenseWithVendorId(
        Number(id),
        {
          status: TRANSACTION_STATUS.UNPAID,
          date: {
            notIn: currentMonthListOfDateString,
          },
        },
      );

      const overdueExpenses = overdueExpensesFromVendor.expenses;

      const overdueAmount = overdueExpenses.reduce((acc: any, expense: any) => {
        return acc + expense?.amount || expense?.total;
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
          Math.round((lastMonthExpenses.totalSpent / totalSpent) * 100 * 100) /
          100,
        thisMonthExpensesPercentage:
          Math.round((totalSpent / lastMonthExpenses.totalSpent) * 100 * 100) /
          100,
      };

      return res.status(200).json({
        data: sortedExpensesByDate,
        chartData: expenses.chartData,
        overview,
        message: 'Fetch Expenses successfully',
      });
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

      // expenses = stockPurchased;

      return res.status(200).json({
        data: stockPurchased.expenses,
        message: 'Fetch Stock Purchased successfully',
      });
    } else if (type && type === VIEW_TYPE.CUSTOM_PURCHASED) {
      const otherPurchased = await getTransactions({
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

      // expenses = stockPurchased;

      return res.status(200).json({
        data: otherPurchased.expenses,
        message: 'Fetch Stock Purchased successfully',
      });
    } else if (type && type === VIEW_TYPE.EXPENSE_TYPE) {
      const expenses = await getTransactions(
        {
          date: {
            in: listOfDateString,
          },
          typeId: Number(id),
          companyId: Number(companyId),
        },
        true,
      );

      return res.status(200).json({
        data: expenses.expenses,
        message: 'Fetch Expenses successfully',
      });
    } else if (type && type === VIEW_TYPE.FIXED_TRANSACTION) {
      const fixedTransaction = await getTransactions({
        date: {
          in: listOfDateString,
        },
        fixedTransactionId: {
          not: null,
        },
      });

      // expenses = fixedTransaction;

      return res.status(200).json({
        data: fixedTransaction.expenses,
        message: 'Fetch Fixed Transaction successfully',
      });
    } else if (type && type === VIEW_TYPE.PAYMENT_METHOD) {
      const expenses = await getTransactions({
        date: {
          in: listOfDateString,
        },
        paymentMethodId: Number(id),
      });

      return res.status(200).json({
        data: expenses.expenses,
        message: 'Fetch Expenses successfully',
      });
    } else if (id) {
      if (type && type === 'batch') {
        const batchTransaction = await prisma.batchTransaction.findUnique({
          where: {
            id: Number(id),
          },
          include: {
            transactions: true,
            paymentMethod: true,
            medias: true,
          },
        });

        return res.status(200).json({
          data: batchTransaction,
          message: 'Fetch Batch Transaction successfully',
        });
      }

      const expenses = await getTransactions({
        id: Number(id),
      });

      console.log(expenses.expenses[0], 'expenses');

      return res.status(200).json({
        data: expenses.expenses[0],
        message: 'Fetch Expenses successfully',
      });
    }
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const getTransactions = async (
  condition: any,
  isIncludeBatchTransaction: boolean = false,
) => {
  // Fetching single expense - only use findUnique when we have an 'id' field
  if (Object.keys(condition).length === 1 && condition.id) {
    const singleExpense = await prisma.expense.findUnique({
      where: { ...condition, batchTransactionId: null },
      include: {
        paymentMethod: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
        type: true,
        medias: true,
        codBoard: true,
        orderedItems: {
          include: {
            inventoryItem: true,
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

    return {
      expenses: [singleExpense],
      chartData: [],
    };
  }
  const expenses = await prisma.expense.findMany({
    where: { ...condition, batchTransactionId: null },
    include: {
      paymentMethod: true,
      vendors: {
        include: {
          vendor: true,
        },
      },
      type: true,
      medias: true,
      codBoard: true,
      orderedItems: {
        include: {
          inventoryItem: true,
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

  let batchTransactions: any = [];

  if (isIncludeBatchTransaction) {
    batchTransactions = await prisma.batchTransaction.findMany({
      where: {
        ...condition,
      },
      include: {
        transactions: true,
        paymentMethod: true,
        medias: true,
        type: true,
      },
    });
  }

  const sortedExpensesByDate = sortExpenseByDate([
    ...expenses,
    ...(batchTransactions ? batchTransactions : []),
  ]);

  const transactionBasedOnDate = sortedExpensesByDate.reduce(
    (acc: any, expense: any) => {
      if (!acc[expense.date]) {
        acc[expense.date] = 0;
      }

      acc[expense.date] += expense?.amount || expense?.total;
      return acc;
    },
    {},
  );

  const chartData = generateChartDataForm(
    transactionBasedOnDate,
    condition.date.in,
  );

  return {
    expenses: sortedExpensesByDate,
    chartData,
  };
};

const generateChartDataForm = (
  transactionBasedOnDate: any,
  listOfDateString: any,
) => {
  console.log(listOfDateString, 'listOfDateString');
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

const getExpenseWithVendorId = async (
  vendorId: number,
  query: any,
  isChartInclude: boolean = false,
) => {
  const expenses = await prisma.expense.findMany({
    where: {
      ...query,
      vendors: {
        some: {
          vendorId: vendorId,
        },
      },
    },
    include: {
      vendors: {
        include: {
          vendor: true,
        },
      },
      paymentMethod: true,
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

  const transactionBasedOnDate = expenses.reduce((acc: any, expense: any) => {
    if (!acc[expense.date]) {
      acc[expense.date] = 0;
    }
    acc[expense.date] += expense?.amount || expense?.total;
    return acc;
  }, {});
  
  const sortedExpensesByDate = sortExpenseByDate(expenses);

  if (isChartInclude) {
    const chartData = generateChartDataForm(
      transactionBasedOnDate,
      query.date.in,
    );

    return {
      expenses: sortedExpensesByDate,
      chartData,
    };
  }

  return {
    expenses: sortedExpensesByDate,
  };
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
  const lastMonthListOfDateString = getLastMonthListOfDateString(startDate);

  const lastMonthExpenses = await getTransactions({
    date: {
      in: lastMonthListOfDateString,
    },
  });

  const totalSpent = lastMonthExpenses.expenses.reduce(
    (acc: any, expense: any) => {
      return acc + expense?.amount || expense?.total;
    },
    0,
  );

  return {
    totalSpent,
    lastMonthExpenses,
  };
};
