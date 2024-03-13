import { YYYYMMDDFormat } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const currentDate = new Date();
    const formattedDate = YYYYMMDDFormat(currentDate);

    const orders = await prisma.orders.findMany({
      where: {
        date: formattedDate,
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(400).json({
        error: 'There is not orders at the momment',
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

        const newItems = await Promise.all(
          items.map(async (item: any) => {
            const newItem: any = await prisma.item.findFirst({
              where: {
                id: item.itemId,
              },
            });
            return {
              ...item,
              ...newItem,
              price: newItem.price * item.quantity,
            };
          }),
        );

        const user: any = await prisma.user.findUnique({
          where: {
            id: order.userId,
          },
        });

        const category: any = await prisma.category.findUnique({
          where: {
            id: user.categoryId,
          },
        });

        return { ...order, items: newItems, ...user, category: category.name };
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
