import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { pusherServer } from '@/app/pusher';
import { generateOrderTemplate } from '@/config/email';
import emailHandler from '../utils/email';

interface BodyProps {
  deliveryDate: string;
  note: string;
  items: OrderedItems[];
  orderId: number;
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

    if (!existingUser) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    const userLastOrder = await prisma.orders.findUnique({
      where: {
        id: body.orderId,
      },
    });

    if (!userLastOrder) {
      return res.status(404).json({
        error: 'Last Order Not Found',
      });
    }

    let total = 0;
    const itemList: any = [];
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
        isReplacement: true,
        updateTime: new Date(),
      },
    });

    const userCategory = await prisma.category.findUnique({
      where: {
        id: existingUser?.categoryId,
      },
    });

    // Notify Email for admin
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    const htmlTemplate: string = generateOrderTemplate(
      existingUser.clientName,
      existingUser.clientId,
      body.items,
      existingUser.contactNumber,
      existingUser.deliveryAddress,
      newOrder.id,
      'REPLACEMENT ORDER',
    );

    await emailHandler(
      emailSendTo,
      'Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );

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
      data: {
        items: itemList,
        ...existingUser,
        ...newOrder,
        totalPrice: total,
        category: userCategory,
      },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
