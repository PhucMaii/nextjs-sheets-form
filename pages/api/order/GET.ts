import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { filterDateRangeOrders } from '../utils/date';
import { ORDER_STATUS } from '@/app/utils/enum';

interface QueryType {
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { startDate, endDate } = req.query as QueryType;

    const session: any = await getServerSession(req, res, authOptions);

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session?.user?.id),
      },
    });

    if (!existingUser) {
      return res.status(401).json({ error: 'User Not Found' });
    }

    const userOrders: any = await prisma.orders.findMany({
      where: {
        userId: existingUser.id,
        status: {
          in: [ORDER_STATUS.COMPLETED, ORDER_STATUS.INCOMPLETED],
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const newOrders = await Promise.all(
      userOrders.map(async (order: any) => {
        const items = await prisma.orderedItems.findMany({
          where: {
            orderId: order.id,
          },
        });

        const newItems = items.map((item: any) => {
          const totalPrice = item.quantity * item.price;
          return { ...item, totalPrice, isAutoPrint: order.isAutoPrint };
        });

        // get user
        const user: any = await prisma.user.findUnique({
          where: {
            id: order.userId,
          },
        });

        const category = await prisma.category.findUnique({
          where: {
            id: user.categoryId,
          },
        });

        return {
          ...order,
          items: newItems,
          ...user,
          id: order.id,
          category,
        };
      }),
    );

    if (!startDate || !endDate) {
      return res.status(200).json({
        data: newOrders,
        message: 'Fetch User Orders Successfully',
      });
    }

    const filteredDateRangeOrders = filterDateRangeOrders(
      newOrders,
      startDate,
      endDate,
    );

    return res.status(200).json({
      data: {
        user: existingUser,
        userOrders: filteredDateRangeOrders,
      },
      message: 'Fetch User Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
