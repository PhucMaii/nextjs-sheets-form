import { Order } from '@/app/admin/orders/page';
import { pusherServer } from '@/app/pusher';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  orderId?: string;
  orderList?: Order[];
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { orderId, orderList } = req.body as BodyTypes;

    if (orderList) {
      for (const order of orderList) {
        const existingOrder = await prisma.orders.findUnique({
          where: {
            id: Number(order.id),
          },
        });

        if (!existingOrder) {
          return res.status(404).json({
            error: 'Order Not Found',
          });
        }

        const deletedOrder = await prisma.orders.delete({
          where: {
            id: Number(order.id),
          },
        });

        await pusherServer.trigger(
          'admin-delete-order',
          'delete-order',
          deletedOrder,
        );
      }
    } else if (orderId) {
      const existingOrder = await prisma.orders.findUnique({
        where: {
          id: Number(orderId),
        },
      });

      if (!existingOrder) {
        return res.status(404).json({
          error: 'Order Not Found',
        });
      }

      await prisma.orders.delete({
        where: {
          id: Number(orderId),
        },
      });
    } else {
      return res.status(500).json({
        error: 'Please provide either order list or order id to be deleted',
      });
    }

    return res.status(200).json({
      message: 'Order Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
