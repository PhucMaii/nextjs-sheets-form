import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  date?: string;
  page?: number;
  pageSize?: number;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { date, page = 1, pageSize = 10 } = req.query as RequestQuery;

    const skip = (page - 1) * pageSize;

    // Fetch today's order and status Incompleted only
    const orders = await prisma.orders.findMany({
      where: {
        deliveryDate: date,
        status: ORDER_STATUS.INCOMPLETED,
      },
      skip,
      take: pageSize,
    });

    if (!orders || orders.length === 0) {
      return res.status(400).json({
        error: 'There is no orders at the momment',
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
          return { ...item, totalPrice };
        });

        // // get item info and price
        // const newItems = await Promise.all(
        //   items.map(async (item: any) => {
        //     const newItem: any = await prisma.orderedItems.findUnique({
        //       where: {
        //         id: item.id,
        //       },
        //     });
        //     return {
        //       ...item,
        //       ...newItem,
        //       totalPrice: newItem.price * item.quantity,
        //       price: newItem.price,
        //     };
        //   }),
        // );

        // get user
        const user: any = await prisma.user.findUnique({
          where: {
            id: order.userId,
          },
        });

        return {
          ...order,
          items: newItems,
          ...user,
          id: order.id,
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
