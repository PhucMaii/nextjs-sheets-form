import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../utils/date';
import { generateListOfDateString } from '@/prisma/seed';
import { PrismaClient } from '@prisma/client';
import { ORDER_STATUS } from '@/app/utils/enum';
import withAuthGuard from '../utils/withAuthGuard';
import { getUserInfo } from '../utils/auth';
import { groupOrderByMMYYYY } from '../admin/clients/debt';
import { calculateTotalPrice, sortKeys } from '../admin/sendInvoicePdf';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const user = await getUserInfo(req, res);

    if (!user) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    const { id: userId } = user;

    const today = getTodayDate();
    const thisMonth = today.date.split('/')[0];
    const thisYear = today.date.split('/')[2];

    const lastMonth = parseInt(thisMonth) - 2;
    console.log(lastMonth, 'last month');
    const year = parseInt(thisYear);

    // First day of the given month
    const firstDay = new Date(year, lastMonth, 1);

    // Last day of the given month
    const lastDay = new Date(year, lastMonth + 1, 0);

    const listOfDateString = generateListOfDateString(firstDay, lastDay);

    const orders = await prisma.orders.findMany({
      where: {
        deliveryDate: {
          in: listOfDateString,
        },
        status: {
          not: ORDER_STATUS.VOID,
        },
        userId: Number(userId),
      },
      include: {
        items: true,
      },
    });

    const previousOrders = await prisma.orders.findMany({
      where: {
        deliveryDate: {
          notIn: listOfDateString,
        },
        userId: Number(userId),
      },
    });

    // Group by month
    const groupedOrders: any = previousOrders.reduce((acc: any, order: any) => {
      const month = Number(order.deliveryDate.split('/')[0]);
      const year = Number(order.deliveryDate.split('/')[2]);

      if (year > Number(thisYear)) {
        return acc;
      }

      const startMonth = lastMonth + 1;

      if (year === Number(thisYear)) {
        if (month > startMonth) {
          return acc;
        }
      }

      const groupKey = `${month}/${year}`;

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      acc[groupKey].push(order);

      return acc;
    }, {});

    const debtOrders = groupOrderByMMYYYY(
      orders,
      thisMonth.split('/')[0],
      thisYear.split('/')[2],
    );
    const balanceDue = calculateTotalPrice(debtOrders);
    const debtData = { ...debtOrders, 'Balance Due': balanceDue };

    const sortedDebtByMonth = sortKeys(debtData);

    return res.status(200).json({
      currentMonthOrders: orders,
      previousGroupMonthOrders: groupedOrders,
      sortDebt: sortedDebtByMonth,
      debtData,
      message: 'Fetch Statement For Current Month Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return;
  }
};

export default withAuthGuard(handler);
