import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  date?: string;
  page?: number;
  pageSize?: number;
  status?: ORDER_STATUS;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      date,
      page = 1,
      pageSize = 10,
      status = ORDER_STATUS.INCOMPLETED,
    } = req.query as RequestQuery;

    const skip = (page - 1) * pageSize;

    // Fetch today's order and status Incompleted only
    const orders = await prisma.orders.findMany({
      where: {
        deliveryDate: date,
        status,
      },
      include: {
        OrderPreference: true,
      },
      orderBy: {
        id: 'desc',
      },
      skip,
      take: pageSize,
    });

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: 'There is no orders at the momment',
        data: orders,
      });
    }

    // Format the return result
    const newOrders = await Promise.all(
      orders.map(async (order: any) => {
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

    return res.status(200).json({
      message: 'Fetch all orders successfully',
      data: newOrders,
    });
  } catch (error: any) {
    console.log('Fail to get order: ', error);
    return res.status(500).json({
      error: 'Fail to get orders: ' + error,
    });
  }
}
