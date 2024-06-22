import { officiallyStartDate } from '@/app/lib/constant';
import { ORDER_STATUS } from '@/app/utils/enum';
import { filterDateRangeOrders } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  startDate?: string;
  endDate?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }
    const prisma = new PrismaClient();

    const { startDate, endDate }: IQuery = req.query;

    if (!startDate || !endDate) {
      return res.status(404).json({
        error: 'Date Range Is Not Provided',
      });
    }

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);

    if (formattedStartDate > formattedEndDate) {
      return res.status(404).json({
        error: 'Date Range Is Not Provided Properly',
      });
    }

    const orders = await prisma.orders.findMany({
      where: {
        status: {
          in: [
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.INCOMPLETED,
          ],
        },
      },
      include: {
        items: true,
        user: true,
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(500).json({
        error: 'Internal Server Error: Could Not Fetch Order',
      });
    }

    // Get all overview data
    const thisMonthOrders = filterDateRangeOrders(
      orders,
      formattedStartDate,
      formattedEndDate,
    );
    const revenue = thisMonthOrders.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);
    const ongoingOrders = thisMonthOrders.filter((order: any) => {
      return order.status !== ORDER_STATUS.COMPLETED;
    });
    const unpaidAmount = ongoingOrders.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);

    const thisMonthRevenueReport: any =
      revenueGroupByDeliveryDate(thisMonthOrders);
    const lastMonthRevenueReport = getLastMonthRevenue(
      orders,
      formattedStartDate,
      thisMonthRevenueReport.values,
    );

    const manifest = generateManifest(thisMonthOrders);

    const overviewData = {
      manifest,
      numberOfOrders: thisMonthOrders.length,
      revenue,
      ongoingOrders: ongoingOrders.length,
      unpaidAmount,
    };

    // Get beansprout data
    // Loop through each order, count the quantity of beansprouts if user.subCategoryId = 1 and = 2
    let BKQuantity = 0;
    let BKRevenue = 0;
    let PPQuantity = 0;
    let PPRevenue = 0;
    let totalItems = 0;
    for (const order of thisMonthOrders) {
      for (const item of order.items) {
        totalItems += item.quantity;
        if (!order.user.subCategoryId) {
          break;
        }

        if (order.user.subCategoryId === 1) {
          if (item.name.includes('BEAN')) {
            const totalPrice =
              Math.round(item.price * item.quantity * 100) / 100;
            BKQuantity += item.quantity;
            BKRevenue += totalPrice;
          }
        }

        if (order.user.subCategoryId === 2) {
          const totalPrice = Math.round(item.price * item.quantity * 100) / 100;
          PPQuantity += item.quantity;
          PPRevenue += totalPrice;
        }
      }
    }

    const BKPercentage = (BKRevenue / revenue) * 100;
    const PPPercentage = (PPRevenue / revenue) * 100;

    const customersInDebt = getCustomersInDebt(
      orders,
      officiallyStartDate,
      formattedStartDate,
    );

    return res.status(200).json({
      data: {
        customersInDebt,
        overviewData,
        reports: {
          thisMonth: thisMonthRevenueReport.values,
          lastMonth: lastMonthRevenueReport,
          timeSeries: thisMonthRevenueReport.keys, // Time series for displaying time for the chart
        },
        beansprouts: {
          BKQuantity,
          BKRevenue,
          BKPercentage,
          PPQuantity,
          PPRevenue,
          PPPercentage,
          totalItems,
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
}

const generateManifest = (orders: any) => {
  const itemList = orders.flatMap((order: any) => {
    return order.items;
  });

  const manifest = itemList.reduce((acc: any, item: any) => {
    const key = item.name;

    if (!acc[key]) {
      acc[key] = item.quantity;
      return acc;
    }

    acc[key] += item.quantity;
    return acc;
  }, {});

  return manifest;
};

const getLastMonthRevenue = (
  orders: any,
  startDate: Date,
  thisMonthRevenue: any[],
) => {
  const lastMonth = startDate.getMonth();

  const lastMonthStart = new Date(startDate.getFullYear(), lastMonth - 1, 1);
  const lastMonthEnd = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
  );
  lastMonthEnd.setDate(0);

  const thisMonthOrders = filterDateRangeOrders(
    orders,
    lastMonthStart,
    lastMonthEnd,
  );
  const revenueByDate = revenueGroupByDeliveryDate(thisMonthOrders);
  const formatLengthRevenue = revenueByDate.values.slice(
    0,
    thisMonthRevenue.length,
  );
  return formatLengthRevenue;
};

const getCustomersInDebt = (orders: any, startDate: Date, endDate: Date) => {
  const ordersInRange = filterDateRangeOrders(orders, startDate, endDate);
  const customersInDebt = ordersInRange.reduce((acc: any, order: any) => {
    if (order.status === ORDER_STATUS.VOID || order.status === ORDER_STATUS.COMPLETED) {
      return acc;
    }
    const key = `${order.user.clientName} __ ${order.user.clientId}`;

    if (!acc[key]) {
      acc[key] = [1, order.totalPrice];
      return acc;
    }

    const newTotalPrice = acc[key][1] + order.totalPrice;
    const newNumberOfOrders = acc[key][0] + 1;
    acc[key] = [newNumberOfOrders, newTotalPrice];
    return acc;
  }, {});

  return customersInDebt;
};

const revenueGroupByDeliveryDate = (orders: any) => {
  const revenueByDate = orders.reduce((acc: any, order: any) => {
    const key = order.deliveryDate;

    if (acc[key]) {
      const newTotalPrice =
        Math.round((acc[key] + order.totalPrice) * 100) / 100;
      acc[key] = newTotalPrice;
    } else {
      acc[key] = Math.round(order.totalPrice * 100) / 100;
    }

    return acc;
  }, {});

  return {
    values: Object.values(revenueByDate),
    keys: Object.keys(revenueByDate),
  };
};
