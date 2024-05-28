import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: ORDER_STATUS;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { date, status } = req.query as RequestQuery;

    // const skip = (page - 1) * pageSize;
    const fetchCondition: any = {};

    if (status && status !== ORDER_STATUS.NONE) {
      fetchCondition.status = status;
    }

    if (date) {
      fetchCondition.deliveryDate = date;
    }

    // Fetch today's order and status Incompleted only
    const orders = await prisma.orders.findMany({
      where: fetchCondition,
      orderBy: [
        {
          updateTime: 'desc', // Sort by updateTime in descending order
        },
        {
          id: 'desc', // If updateTime is the same, sort by id in ascending order
        },
      ],
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
          include: {
            routes: true,
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
      message: 'Fetch All Orders Successfully',
      data: newOrders,
    });
  } catch (error: any) {
    console.log('Fail to get order: ', error);
    return res.status(500).json({
      error: 'Fail to get orders: ' + error,
    });
  }
}
