import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
  status?: ORDER_STATUS;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      startDate,
      endDate,
      page = 1,
      pageSize = 100,
      status = ORDER_STATUS.INCOMPLETED,
    } = req.query as RequestQuery;

    const skip = (page - 1) * pageSize;

    // Fetch today's order and status Incompleted only
    const orders = await prisma.orders.findMany({
      where: {
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

    if (!startDate || !endDate) {
      return res.status(200).json({
        message: 'Fetch all orders successfully',
        data: newOrders,
      });
    }

    const filteredDateRangeOrders = newOrders.filter((order: any) => {
      const parts = order.deliveryDate.split("/");
      const month = parseInt(parts[0], 10) - 1; // Months are 0-indexed in JavaScript, so subtract 1
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      const orderDeliveryDate = new Date(year, month, day);

      return orderDeliveryDate >= startDate && orderDeliveryDate <= endDate;
    })

    return res.status(200).json({
      message: 'Fetch All Orders Successfully',
      data: filteredDateRangeOrders
    })

  } catch (error: any) {
    console.log('Fail to get order: ', error);
    return res.status(500).json({
      error: 'Fail to get orders: ' + error,
    });
  }
}
