// import { officiallyStartDate } from '@/app/lib/constant';
import { ORDER_STATUS } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate, sortByDeliveryDate } from '@/pages/api/utils/date';
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

    // Generate list of dates in range
    const datesInRange = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );
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
        items: true,
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

    // Get beansprout data
    // Loop through each order, count the quantity of beansprouts if user.subCategoryId = 1 and = 2
    // const BKRevenue = 0;
    // const BKQuantity = 0;
    // const PPQuantity = 0;
    // const PPRevenue = 0;
    // const totalItems = 0;

    // const BKPercentage = (BKRevenue / revenue) * 100;
    // const PPPercentage = (PPRevenue / revenue) * 100;

    // Calculate customers in debt
    const debtRange = generateListOfDateString(
      officiallyStartDate,
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
          items: true,
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
        reports: {
          thisMonth: thisMonthRevenueReport.values,
          lastMonth: lastMonthRevenueReport.chartData,
          timeSeries: thisMonthRevenueReport.keys, // Time series for displaying time for the chart
        },
        // beansprouts: {
        //   BK: {
        //     quantity: BKQuantity,
        //     revenue: BKRevenue,
        //     percentage: BKPercentage,
        //   },
        //   PP: {
        //     quantity: PPQuantity,
        //     revenue: PPRevenue,
        //     percentage: PPPercentage,
        //   },
        //   totalItems,
        // },
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
