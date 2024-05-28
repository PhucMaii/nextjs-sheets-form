import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
  deliveryDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { userId, deliveryDate } = req.query as RequestQuery;

    // Check if there is no userId, then fetch all orders with specific delivery date
    let userOrders: any = [];
    if (userId && !isNaN(Number(userId))) {
      userOrders = await prisma.orders.findMany({
        where: {
          userId: Number(userId),
        },
        include: {
          items: true,
          user: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
    } else {
      userOrders = await prisma.orders.findMany({
        where: {
          deliveryDate,
        },
        include: {
          items: true,
          user: {
            include: {
              category: true,
              routes: true
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
    }

    const formatUserOrders = userOrders.map((order: any) => {
      const formatItems = order.items.map((item: OrderedItems) => {
        const totalPrice = item.price * item.quantity;
        return { ...item, totalPrice };
      });

      // ...user for printing, regular user for displaying in table
      const { user, ...restOfData } = order;
      return { ...user, ...restOfData, user, items: formatItems };
    });

    // if (!startDate || !endDate) {
    //   return res.status(200).json({
    //     data: formatUserOrders,
    //     message: 'Fetch User Orders Successfully',
    //   });
    // }

    // const filteredDateRangeOrders = filterDateRangeOrders(
    //   formatUserOrders,
    //   startDate,
    //   endDate,
    // );

    return res.status(200).json({
      data: formatUserOrders,
      message: 'Fetch User Orders In Date Range Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
