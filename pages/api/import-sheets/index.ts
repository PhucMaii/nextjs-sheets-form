// import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../utils/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { FLAG_ORDER_TYPE, ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
// import { sheetStructure } from '@/config/sheetStructure';
import { pusherServer } from '@/app/pusher';
import { convertDeliveryDateStringToDate } from '../utils/date';

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
    const body: any = req.body;
    const isCheckUnavailableRange = body?.isCheckUnavailableRange;

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
      include: {
        unavailableDayRange: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    // Check is delivery date in client's vacation range
    if (isCheckUnavailableRange) {
      const deliveryDate = convertDeliveryDateStringToDate(
        body['DELIVERY DATE'],
      );
      for (const dayRange of existingUser.unavailableDayRange) {
        const startDate = new Date(dayRange.startDate);
        const endDate = new Date(dayRange.endDate);

        if (
          deliveryDate >= startDate &&
          deliveryDate <= endDate
        ) {
          return res.status(200).json({
            warning: `Client ${
              existingUser.clientName
            } has request time off from ${dayRange.startDate.toDateString()} to ${dayRange.endDate.toDateString()}`,
            data: {
              unavailableRange: [dayRange.startDate, dayRange.endDate],
              client: existingUser,
            },
            flag: FLAG_ORDER_TYPE.VACATION_ORDER,
          });
        }
      }
    }

    // Check has user ordered for target delivery date yet
    const userOrder = await checkHasClientOrder(
      existingUser.id,
      body['DELIVERY DATE'],
    );

    if (userOrder) {
      return res.status(200).json({
        warning: `Client ${existingUser.clientName} has ordered for ${body['DELIVERY DATE']}`,
        data: userOrder,
        flag: FLAG_ORDER_TYPE.ALREADY_ORDER,
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

    // Get info person create it
    let createdBy = '';

    const session: any = await getServerSession(req, res, authOptions);
    if (body?.createdBy === USER_ROLE.DRIVER) {
      const driverCreate: any = await prisma.driver.findUnique({
        where: {
          id: Number(session.user.id)
        }
      });

      createdBy = `Driver - ${driverCreate.name}`
    } else if (body?.createdBy === USER_ROLE.ADMIN || body?.createdBy === USER_ROLE.CLIENT ) {
      const userCreate: any = await prisma.user.findUnique({
        where: {
          id: Number(session.user.id)
        }
      });

      if (userCreate.role === USER_ROLE.ADMIN) {
        createdBy = `Admin - ${userCreate.clientName}`
      }
      
      if (userCreate.role === USER_ROLE.CLIENT) {
        createdBy = `Client - ${userCreate.clientId}`
      }
    }

    // Initialize new order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate: body['DELIVERY DATE'],
        orderTime: body.orderTime,
        userId: existingUser.id,
        totalPrice: 0,
        note: body['NOTE'],
        status: ORDER_STATUS.INCOMPLETED,
        createdBy
      },
    });

    let totalPrice = 0;
    const itemList: any = [];
    // Loop through each item from request and save it to order
    for (const item of Object.keys(body)) {
      if (item === 'DELIVERY DATE') {
        continue;
      }

      let itemData = await prisma.item.findFirst({
        where: {
          name: item,
          categoryId: existingUser.categoryId,
        },
      });

      if (existingUser.subCategoryId && itemData?.subCategoryId) {
        itemData = await prisma.item.findFirst({
          where: {
            name: itemData.name,
            categoryId: existingUser.categoryId,
            subCategoryId: existingUser.subCategoryId,
          },
        });
      }

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
        items: true,
      },
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
    const isSendToAdmin = true;
    await sendEmail(
      existingUser,
      updatedNewOrder.items,
      newOrder.id,
      body['DELIVERY DATE'],
      isSendToAdmin,
      body['NOTE'],
    );

    return res.status(200).json({
      // overviewFormattedData,
      message: 'Order Submitted Successfully',
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
