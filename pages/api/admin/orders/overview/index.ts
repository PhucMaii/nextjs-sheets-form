// import { officiallyStartDate } from '@/app/lib/constant';
import { ORDER_STATUS } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import { sortByDeliveryDate } from '@/pages/api/utils/date';
import moment from 'moment-timezone';
import {
  generateManifest,
  getCustomersInDebt,
  getLastMonthExpenses,
  getLastMonthRevenue,
  revenueGroupByDeliveryDate,
} from '@/pages/api/utils/overview';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateOrderProfit } from '../GET';

interface IQuery {
  startDate?: string;
  endDate?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }
    const prisma = new PrismaClient();
    const officiallyStartDate = new Date(2024, 0, 1);

    const { startDate, endDate }: IQuery = req.query;

    if (!startDate || !endDate) {
      return res.status(404).json({
        error: 'Date Range Is Not Provided',
      });
    }

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));

    // formattedEndDate.setDate(formattedEndDate.getDate() - 1);

    if (formattedStartDate > formattedEndDate) {
      return res.status(404).json({
        error: 'Date Range Is Not Provided Properly',
      });
    }

    const startDateDate = startDate.split(' ')[2];
    const startDateMonth = startDate.split(' ')[1];
    const startDateYear = startDate.split(' ')[3];

    const endDateDate = endDate.split(' ')[2];
    const endDateMonth = endDate.split(' ')[1];
    const endDateYear = endDate.split(' ')[3];

    const isOneDayOverview =
      startDateDate === endDateDate &&
      startDateMonth === endDateMonth &&
      startDateYear === endDateYear;

    const isAddUpEndDate = !isOneDayOverview;

    // Generate list of dates in range
    const datesInRange = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
      isAddUpEndDate,
    );

    console.log({
      startDate,
      endDate,
      formattedStartDate,
      formattedEndDate,
      datesInRange,
    });

    const orders: any = await prisma.orders.findMany({
      where: {
        status: {
          in: [
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.INCOMPLETED,
          ],
        },
        deliveryDate: {
          in: datesInRange,
        },
      },
      include: {
        items: {
          where: {
            quantity: {
              gt: 0,
            },
          },
        },
        user: true,
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(500).json({
        error: 'No Orders Found',
      });
    }

    // Calculate overview data
    const sortedThisMonthOrders = sortByDeliveryDate(orders);

    const revenue = sortedThisMonthOrders.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);
    const ongoingOrders = sortedThisMonthOrders.filter((order: any) => {
      return order.status !== ORDER_STATUS.COMPLETED;
    });
    const unpaidAmount = ongoingOrders.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);

    const thisMonthRevenueReport: any = revenueGroupByDeliveryDate(
      sortedThisMonthOrders,
    );
    const lastMonthRevenueReport: any = await getLastMonthRevenue(
      thisMonthRevenueReport,
      formattedStartDate,
    );

    const revenueChange =
      ((revenue - lastMonthRevenueReport.revenue) /
        lastMonthRevenueReport.revenue) *
      100;

    // EXPENSES
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          in: datesInRange,
        },
      },
    });
    const totalExpenses = expenses.reduce((acc: number, expense: any) => {
      return acc + expense.amount;
    }, 0);
    const lastMonthExpenses: any =
      await getLastMonthExpenses(formattedStartDate);
    const totalExpensesChange =
      ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

    // PROFIT
    const profit = revenue - totalExpenses;
    const lastMonthProfit = lastMonthRevenueReport.revenue - lastMonthExpenses;
    const profitChange = ((profit - lastMonthProfit) / lastMonthProfit) * 100;

    // Calculate each customer's profit
    const customersProfit = orders.reduce((acc: any, order: any) => {
      const clientKey = `${order.user.clientName} __ ${order.user.clientId}`;
      if (!acc[clientKey]) {
        acc[clientKey] = { amount: 0, percentage: 0 };
      }

      const orderProfit = calculateOrderProfit(order.items);
      const newTotalProfit = acc[clientKey].amount + orderProfit;

      acc[clientKey] = {
        amount: newTotalProfit,
        percentage: (newTotalProfit / profit) * 100,
      };

      return acc;
    }, {});

    console.log('profitChange', {
      profitChange,
      lastMonthProfit,
      lastMonthREvenue: lastMonthRevenueReport.revenue,
      lastMonthExpenses,
    });

    const manifest = generateManifest(sortedThisMonthOrders, revenue);

    const overviewData = {
      manifest,
      numberOfOrders: sortedThisMonthOrders.length,
      revenue,
      revenueChange,
      ongoingOrders: ongoingOrders.length,
      unpaidAmount,
      expenses: totalExpenses,
      expensesChange: totalExpensesChange,
      profit,
      profitChange,
    };

    // Calculate customers in debt
    const debtRange = generateListOfDateString(
      normalizeDate(officiallyStartDate),
      formattedEndDate,
    );

    let debtOrders: any = [];
    const debtFetchSize = 1000;
    let debtFetchSkip = 0;
    const trueCondition = true;

    while (trueCondition) {
      const fetchedDebtOrders: any = await prisma.orders.findMany({
        where: {
          status: {
            in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
          },
          deliveryDate: {
            in: debtRange,
          },
        },
        include: {
          items: {
            where: {
              quantity: {
                gt: 0,
              },
            },
          },
          user: true,
        },
        take: debtFetchSize,
        skip: debtFetchSkip,
      });

      if (fetchedDebtOrders.length === 0) break;

      debtOrders = debtOrders.concat(fetchedDebtOrders);
      debtFetchSkip += fetchedDebtOrders.length;
    }

    const customersInDebt = getCustomersInDebt(debtOrders);

    return res.status(200).json({
      data: {
        customersInDebt,
        overviewData,
        customersProfit,
        reports: {
          thisMonth: thisMonthRevenueReport.values,
          lastMonth: lastMonthRevenueReport.chartData,
          timeSeries: thisMonthRevenueReport.keys, // Time series for displaying time for the chart
        },
      },
      message: 'Fetch Overview Data Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);

const normalizeDate = (date: Date | string) => {
  return moment.tz(date, 'America/Los_Angeles').startOf('day').toDate();
};
