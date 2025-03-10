import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate } from '@/pages/api/utils/date';
import {
  formatItemsWithTotalPrice,
  getOverdueOrders,
} from '@/pages/api/utils/order';
import { Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateOrderProfit } from '../../orders/GET';

interface RequestQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
  deliveryDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { userId, deliveryDate, startDate, endDate } =
      req.query as RequestQuery;

    // Check if there is no userId, then fetch all orders with specific delivery date
    let userOrders: any = [];

    let overDueOrders: any = null;
    if (userId && !isNaN(Number(userId))) {
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Start Date and End Date are required',
        });
      }
      const normalizedStartDate = normalizeDate(new Date(startDate));
      const normalizedEndDate = normalizeDate(new Date(endDate));
      const listOfDateString = generateListOfDateString(
        normalizedStartDate,
        normalizedEndDate,
      );

      console.log({
        startDate,
        endDate,
        normalizedStartDate,
        normalizedEndDate,
        listOfDateString,
      });

      userOrders = await prisma.orders.findMany({
        where: {
          userId: Number(userId),
          deliveryDate: {
            in: listOfDateString,
          },
        },
        include: {
          items: {
            include: {
              inventoryItem: true,
              inventoryUnit: true,
              fifo: true,
            },
          },
          user: {
            include: {
              category: true,
              preference: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });

      const { orders } = await getOverdueOrders(Number(userId));
      overDueOrders = orders;

      // overDueOrders = await prisma.orders.findMany({
      //   where: {
      //     userId: Number(userId),
      //     deliveryDate: {
      //       notIn: listOfDateString,
      //     },
      //     status: {
      //       in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
      //     }
      //   },
      //   include: {
      //     items: {
      //       include: {
      //         inventoryItem: true,
      //         inventoryUnit: true,
      //         fifo: true,
      //       },
      //     },
      //     user: {
      //       include: {
      //         category: true,
      //         preference: true,
      //       },
      //     },
      //   },
      //   orderBy: {
      //     id: 'desc',
      //   },
      // });
    } else {
      userOrders = await prisma.orders.findMany({
        where: {
          deliveryDate,
        },
        include: {
          items: {
            include: {
              inventoryItem: true,
              inventoryUnit: true,
              fifo: true,
            },
          },
          user: {
            include: {
              category: true,
              routes: true,
              preference: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
    }

    const formatUserOrders = userOrders.map((order: any) => {
      const formatItems = formatItemsWithTotalPrice(order.items);
      const profit = calculateOrderProfit(formatItems);

      // ...user for printing, regular user for displaying in table
      const { user, ...restOfData } = order;
      return {
        ...user,
        ...restOfData,
        user,
        items: formatItems,
        profit: profit || 0,
      };
    });

    const overDueAmount =
      overDueOrders?.reduce((acc: number, order: Orders) => {
        return acc + order.totalPrice;
      }, 0) || 0;

    return res.status(200).json({
      data: formatUserOrders,
      overDueOrders,
      overDueAmount,
      message: 'Fetch User Orders In Date Range Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
