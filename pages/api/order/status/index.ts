import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { pusherServer } from '@/app/pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

interface BodyTypes {
  orderId: number;
  updatedStatus: ORDER_STATUS;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(401).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();
    const { orderId, updatedStatus }: BodyTypes = req.body;

    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'You are not authenticated' });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order id does not exist',
      });
    }

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        status: updatedStatus,
      },
    });

    let total = 0;
    const itemList: any = [];
    for (const item of existingOrder.items) {
      // Update each item
      const newItem = await prisma.orderedItems.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: item.quantity,
        },
      });

      // Update new total price
      total += newItem.quantity * newItem.price;
      itemList.push({
        ...newItem,
        totalPrice: newItem.quantity * newItem.price,
      });
    }

    const userCategory = await prisma.category.findUnique({
      where: {
        id: existingUser?.categoryId,
      },
    });

    await pusherServer.trigger('void-order', 'incoming-order', {
      ...existingUser,
      ...existingOrder,
      items: itemList,
      totalPrice: total,
      category: userCategory,
      isVoid: true,
    });

    return res.status(200).json({
      data: updatedOrder,
      message: 'Order Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default handler;
