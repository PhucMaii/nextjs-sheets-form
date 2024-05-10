// import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../utils/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { ORDER_STATUS } from '@/app/utils/enum';
// import { sheetStructure } from '@/config/sheetStructure';
import { pusherServer } from '@/app/pusher';

interface RequestQuery {
  userId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(500).send('Only Post method allowed');
  }

  try {
    const prisma = new PrismaClient();
    const { userId } = req.query as RequestQuery;

    let id = userId;

    // Check is user authenticated
    if (!userId) {
      const session: any = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'You are not authenticated' });
      }
      id = session.user.id;
    }

    // Check does user exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    // Check has user ordered for target delivery date yet
    const body: any = req.body;
    const userOrder = await checkHasClientOrder(
      existingUser.id,
      body['DELIVERY DATE'],
    );

    if (userOrder) {
      return res.status(200).json({
        warning: `Client ${existingUser.clientName} has ordered for ${body['DELIVERY DATE']}`,
        data: userOrder,
      });
    }

    const userCategory = await prisma.category.findUnique({
      where: {
        id: existingUser.categoryId,
      },
    });

    const items = await prisma.item.findMany({
      where: {
        categoryId: existingUser.categoryId,
      },
    });

    // Initialize new order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate: body['DELIVERY DATE'],
        orderTime: body.orderTime,
        userId: existingUser.id,
        totalPrice: 0,
        note: body['NOTE'],
        status: ORDER_STATUS.INCOMPLETED,
      },
    });

    let totalPrice = 0;
    const itemList: any = [];
    // Loop through each item from request and save it to order
    for (const item of Object.keys(body)) {
      if (item === 'DELIVERY DATE') {
        continue;
      }

      const itemData = await prisma.item.findFirst({
        where: {
          name: item,
          categoryId: existingUser.categoryId,
        },
      });

      if (itemData) {
        totalPrice += itemData.price * body[item];
        const orderedItems = await prisma.orderedItems.create({
          data: {
            name: itemData.name,
            price: itemData.price,
            orderId: newOrder.id,
            quantity: body[item],
          },
        });

        itemList.push({
          ...orderedItems,
          totalPrice: itemData.price * body[item],
        });
      }
    }

    // Update the order with the totalPrice
    const updatedNewOrder = await prisma.orders.update({
      where: {
        id: newOrder.id,
      },
      data: {
        totalPrice,
      },
      include: {
        items: true
      }
    });

    await pusherServer.trigger('admin', 'incoming-order', {
      items: itemList,
      ...existingUser,
      ...newOrder,
      totalPrice,
      category: userCategory,
    });

    // Generate object of quantity, price, and totalPrice
    const orderDetails = body;
    for (const item of items) {
      if (Object.prototype.hasOwnProperty.call(body, item.name)) {
        orderDetails[item.name] = {
          quantity: orderDetails[item.name],
          price: item.price,
          totalPrice: orderDetails[item.name] * item.price,
        };
      }
    }

    // Notify Email for admin
    // const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    // const htmlTemplate: string = generateOrderTemplate(
    //   existingUser.clientName,
    //   existingUser.clientId,
    //   orderDetails,
    //   existingUser.contactNumber,
    //   existingUser.deliveryAddress,
    //   newOrder.id,
    // );

    // await emailHandler(
    //   emailSendTo,
    //   'Order Supreme Sprouts',
    //   'Supreme Sprouts LTD',
    //   htmlTemplate,
    // );

    // if (existingUser.email) {
    //   await emailHandler(
    //     existingUser.email,
    //     'Order Supreme Sprouts',
    //     'Supreme Sprouts LTD',
    //     htmlTemplate,
    //   );
    // }
    const isSendToAdmin = true;
    await sendEmail(
      existingUser,
      updatedNewOrder.items,
      newOrder.id,
      body['DELIVERY DATE'],
      isSendToAdmin,
      body['NOTE']
    );

    return res.status(200).json({
      // overviewFormattedData,
      message: 'Data Added Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default handler;

export const checkHasClientOrder = async (id: number, deliveryDate: string) => {
  const prisma = new PrismaClient();

  const userOrders = await prisma.orders.findFirst({
    where: {
      userId: id,
      deliveryDate,
      status: {
        in: [
          ORDER_STATUS.COMPLETED,
          ORDER_STATUS.INCOMPLETED,
          ORDER_STATUS.DELIVERED,
        ],
      },
    },
    include: {
      items: true,
    },
  });

  return userOrders;
};
