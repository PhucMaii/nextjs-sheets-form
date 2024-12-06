import { Order } from '@/app/admin/orders/page';
// import { officiallyStartDate } from '@/app/lib/constant';
import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate, sortByDeliveryDate } from '@/pages/api/utils/date';
import { checkIsKorean } from '@/pages/api/utils/korean';
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
    const lastMonthRevenueReport = await getLastMonthRevenue(
      thisMonthRevenueReport,
      formattedStartDate,
    );

    const manifest = generateManifest(sortedThisMonthOrders, revenue);

    const overviewData = {
      manifest,
      numberOfOrders: sortedThisMonthOrders.length,
      revenue,
      ongoingOrders: ongoingOrders.length,
      unpaidAmount,
    };

    // Get beansprout data
    // Loop through each order, count the quantity of beansprouts if user.subCategoryId = 1 and = 2
    const BKRevenue = 0;
    const BKQuantity = 0;
    const PPQuantity = 0;
    const PPRevenue = 0;
    const totalItems = 0;

    const BKPercentage = (BKRevenue / revenue) * 100;
    const PPPercentage = (PPRevenue / revenue) * 100;

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
          lastMonth: lastMonthRevenueReport,
          timeSeries: thisMonthRevenueReport.keys, // Time series for displaying time for the chart
        },
        beansprouts: {
          BK: {
            quantity: BKQuantity,
            revenue: BKRevenue,
            percentage: BKPercentage,
          },
          PP: {
            quantity: PPQuantity,
            revenue: PPRevenue,
            percentage: PPPercentage,
          },
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
};

export default withAdminAuthGuard(handler);

export const generateManifest = (orders: any, revenue: number = 0) => {
  const itemList = orders.flatMap((order: any) => {
    return order.items;
  });

  if (revenue === 0) {
    const manifest = itemList.reduce((acc: any, item: any) => {
      const { name } = item;

      let itemKey = name;

      if (checkIsKorean(itemKey.split(' - ')[0])) {
        itemKey = itemKey.split(' - ')[1];
      } else {
        itemKey = itemKey.includes('KONGNAMUL')
          ? itemKey.split(' - ')[1]
          : itemKey;
      }

      if (!acc[itemKey]) {
        acc[itemKey] = item.quantity;
        return acc;
      }

      acc[itemKey] += item.quantity;
      return acc;
    }, {});
    return manifest;
  }

  const manifest = itemList.reduce((acc: any, item: any) => {
    const { name } = item;

    let itemKey = name;

    if (checkIsKorean(itemKey.split(' - ')[0])) {
      itemKey = itemKey.split(' - ')[1];
    } else {
      itemKey = itemKey.includes('KONGNAMUL')
        ? itemKey.split(' - ')[1]
        : itemKey;
    }
    const itemPrice = item.quantity * item.price;

    if (!acc[itemKey]) {
      const percentageTake = (itemPrice / revenue) * 100;
      acc[itemKey] = {
        quantity: item.quantity,
        price: itemPrice,
        percentage: percentageTake.toFixed(2),
      };
      return acc;
    }

    const newTotalPrice = acc[itemKey].price + itemPrice;
    const newPercentageTake = (newTotalPrice / revenue) * 100;
    acc[itemKey] = {
      quantity: acc[itemKey].quantity + item.quantity,
      price: newTotalPrice,
      percentage: newPercentageTake.toFixed(2),
    };
    return acc;
  }, {});

  return manifest;
};

const getLastMonthRevenue = async (
  // orders: any,
  // startDate: Date,
  thisMonthRevenue: any[],
  startDate: Date,
) => {
  const prisma = new PrismaClient();
  const lastMonth = startDate.getMonth();

  const lastMonthStart = new Date(startDate.getFullYear(), lastMonth - 2, 1);
  const lastMonthEnd = new Date(
    startDate.getFullYear(),
    startDate.getMonth() - 1,
    1,
  );
  lastMonthEnd.setDate(0);

  const datesInRange = generateListOfDateString(lastMonthStart, lastMonthEnd);
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
  const revenueByDate = revenueGroupByDeliveryDate(orders);
  const formatLengthRevenue = revenueByDate.values.slice(
    0,
    thisMonthRevenue.values.length,
  );
  return formatLengthRevenue;
};

const getCustomersInDebt = (debtOrders: Order[]) => {
  const customersInDebt = debtOrders.reduce((acc: any, order: any) => {
    if (order.user.role === USER_ROLE.ADMIN) {
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
