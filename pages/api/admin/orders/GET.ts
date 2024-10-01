import { ORDER_STATUS } from '@/app/utils/enum';
import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  date?: string;
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

    const orders: any = await prisma.orders.findMany({
      where: fetchCondition,
      orderBy: [
        {
          updateTime: 'desc', // Sort by updateTime in descending order
        },
        {
          id: 'desc', // If updateTime is the same, sort by id in ascending order
        },
      ],
      include: {
        user: {
          include: {
            routes: true,
            preference: true,
            category: true,
          },
        },
        items: true,
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: 'There is no orders at the momment',
        data: orders,
      });
    }

    // Format return result
    const newOrders = orders.map((order: any) => {
      const formattedItems = order.items.map((item: OrderedItems) => {
        const totalPrice = item.quantity * item.price;
        return {
          ...item,
          totalPrice,
        };
      });

      return {
        ...order,
        items: formattedItems,
        ...order.user,
        id: order.id,
        category: order.user.category,
      };
    });

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
