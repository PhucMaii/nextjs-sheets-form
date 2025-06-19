import { PrismaClient } from '@prisma/client';
import { checkIsKorean } from './korean';
import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { normalizeDate } from './date';
import { generateListOfDateString } from '@/app/utils/time';

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

export const getLastMonthRevenue = async (
  companyId: number,
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

  const datesInRange = generateListOfDateString(
    normalizeDate(lastMonthStart),
    normalizeDate(lastMonthEnd),
  );
  const orders: any = await prisma.orders.findMany({
    where: {
      companyId,
      status: {
        not: ORDER_STATUS.VOID,
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
  const revenueByDate: any = revenueGroupByDeliveryDate(orders);
  const formatLengthRevenue: any = revenueByDate.values.slice(
    0,
    thisMonthRevenue.values.length,
  );

  // Last Month Total Revenue
  const lastMonthRevenue = revenueByDate.values.reduce(
    (acc: number, value: number) => {
      return acc + value;
    },
    0,
  );
  return {
    chartData: formatLengthRevenue,
    revenue: lastMonthRevenue,
    keys: revenueByDate.keys,
  };
};

export const getCustomersInDebt = (debtOrders: Order[]) => {
  const customersInDebt = debtOrders.reduce((acc: any, order: any) => {
    if (
      order.user.role === USER_ROLE.ADMIN ||
      order.user.role === USER_ROLE.SUPER_ADMIN
    ) {
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

export const revenueGroupByDeliveryDate = (orders: any) => {
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

export const getLastMonthExpenses = async (
  companyId: number,
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

  const datesInRange = generateListOfDateString(
    normalizeDate(lastMonthStart),
    normalizeDate(lastMonthEnd),
  );
  const transactions: any = await prisma.expense.findMany({
    where: {
      companyId,
      date: {
        in: datesInRange,
      },
    },
  });

  const totalExpenses = transactions.reduce((acc: number, transaction: any) => {
    return acc + transaction.amount;
  }, 0);

  return totalExpenses;
};
