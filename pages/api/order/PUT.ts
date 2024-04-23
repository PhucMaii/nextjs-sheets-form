import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { pusherServer } from '@/app/pusher';

interface BodyProps {
  deliveryDate: string;
  note: string;
  items: OrderedItems[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const body = req.body as BodyProps;

    const session: any = await getServerSession(req, res, authOptions);
    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    const userLastOrder = await prisma.orders.findFirst({
      where: {
        userId: existingUser?.id,
        deliveryDate: body.deliveryDate,
      },
    });

    if (!userLastOrder) {
      return res.status(404).json({
        error: 'Last Order Not Found',
      });
    }

    let total = 0;
    const itemList = [];
    for (const item of body.items) {
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

    // Apply new total price on order and update note
    const newOrder = await prisma.orders.update({
      where: {
        id: userLastOrder.id,
      },
      data: {
        totalPrice: total,
        note: body.note,
      },
    });

    const userCategory = await prisma.category.findUnique({
      where: {
        id: existingUser?.categoryId,
      },
    });

    await pusherServer.trigger('override-order', 'incoming-order', {
      items: itemList,
      ...existingUser,
      ...newOrder,
      totalPrice: total,
      category: userCategory,
      isReplacement: true,
    });

    return res.status(200).json({
      message: 'Override Order Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
