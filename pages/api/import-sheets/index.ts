// import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../utils/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { FLAG_ORDER_TYPE, ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
// import { sheetStructure } from '@/config/sheetStructure';
import { pusherServer } from '@/app/pusher';
import { normalizeDate } from '../utils/date';
import withAuthGuard from '../utils/withAuthGuard';

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
        category: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    // Check is delivery date in client's vacation range
    if (isCheckUnavailableRange) {
      const deliveryDate = normalizeDate(new Date(body['DELIVERY DATE']));
      for (const dayRange of existingUser.unavailableDayRange) {
        const normalizedStartDate = normalizeDate(dayRange.startDate);
        const normalizedEndDate = normalizeDate(dayRange.endDate);

        normalizedEndDate.setDate(normalizedEndDate.getDate() - 1);
        if (
          deliveryDate >= normalizedStartDate &&
          deliveryDate <= normalizedEndDate
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

    // Check has user already ordered for target delivery date yet
    const userOrder = await checkHasClientOrder(
      existingUser.id,
      body['DELIVERY DATE'],
    );

    if (userOrder) {
      if (body.createdBy !== USER_ROLE.CLIENT) {
        return res.status(200).json({
          warning: `Client ${existingUser.clientName} has ordered for ${body['DELIVERY DATE']}`,
          data: userOrder,
          flag: FLAG_ORDER_TYPE.ALREADY_ORDER,
        });
      }

      const newItems = Object.keys(body).filter((item: string) => {
        return item !== 'DELIVERY DATE' && item !== 'NOTE';
      });

      const items = userOrder.items.map((item: any) => {
        const targetNewItem = newItems.find(
          (newItemName: any) => item.name === newItemName,
        );

        if (targetNewItem) {
          return { ...item, quantity: body[targetNewItem] };
        }

        return item;
      });

      const createdBy = await getCreatedBy(req, res, body.createdBy);
      await overrideOrder(
        existingUser,
        userOrder.id,
        items,
        body['NOTE'],
        createdBy,
      );
      return res.status(201).json({
        message: 'Order Submitted Successfully',
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

    const createdBy = await getCreatedBy(req, res, body.createdBy);

    // Initialize new order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate: body['DELIVERY DATE'],
        orderTime: body.orderTime,
        userId: existingUser.id,
        totalPrice: 0,
        note: body['NOTE'],
        status: ORDER_STATUS.INCOMPLETED,
        createdBy,
      },
    });

    let totalPrice = 0;
    const itemList: any = [];
    // Loop through each item from request and save it to order
    for (const item of Object.keys(body)) {
      if (item === 'DELIVERY DATE') {
        continue;
      }

      if (item === 'NOTE') {
        continue;
      }

      const itemData = await prisma.item.findFirst({
        where: {
          name: item,
          categoryId: existingUser.categoryId,
        },
      });

      // if (!itemData?.inventoryItemId) {
      //   return res.status(500).json({
      //     error: `Item ${item} has no inventory item`,
      //   });
      // }
      // Get inventory item
      let inventoryItem: any = null;

      if (itemData?.inventoryItemId) {
        inventoryItem = await prisma.inventoryItem.findUnique({
          where: {
            id: itemData.inventoryItemId,
          }
        });
      }

      // if (!inventoryItem) {
      //   return res.status(500).json({
      //     error: `Inventory Item for item ${item} does not exist`,
      //   });
      // }

      if (itemData) {
        totalPrice += itemData.price * body[item];
        
        const orderedItems = await prisma.orderedItems.create({
          data: {
            name: itemData.name,
            price: itemData.price,
            orderId: newOrder.id,
            quantity: body[item],
            inventoryItemId: itemData.inventoryItemId,
          },
        });

        itemList.push({
          ...orderedItems,
          totalPrice: itemData.price * body[item],
        });

        if (inventoryItem) {
          // update inventoryItem
          await prisma.inventoryItem.update({
            where: {
              id: inventoryItem.id,
            },
            data: {
              quantity: inventoryItem.quantity - body[item],
            },
          });
        }
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
        user: {
          include: {
            category: true,
          },
        },
      },
    });

    await pusherServer?.trigger('admin', 'incoming-order', {
      ...updatedNewOrder,
      items: itemList,
      ...existingUser,
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

export default withAuthGuard(handler);

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

const overrideOrder = async (
  user: any,
  orderId: number,
  newItems: any,
  newNote: string,
  updatedBy: string,
) => {
  const prisma = new PrismaClient();
  try {
    let total = 0;
    const itemList: any = [];
    for (const item of newItems) {
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

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: total,
        note: newNote,
        isReplacement: updatedBy.split(' - ')[0] === 'Client' ? true : false,
        updateTime: new Date(),
        updatedBy,
      },
    });

    await sendEmail(
      user,
      itemList,
      orderId,
      updatedOrder.deliveryDate,
      true,
      newNote,
    );

    await pusherServer?.trigger('override-order', 'incoming-order', {
      items: itemList,
      ...user,
      ...updatedOrder,
      totalPrice: total,
      category: user.category,
      isReplacement: updatedBy.split(' - ')[0] === 'Client' ? true : false,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

const getCreatedBy = async (
  req: NextApiRequest,
  res: NextApiResponse,
  createdByRole: USER_ROLE,
) => {
  const prisma = new PrismaClient();
  const session: any = await getServerSession(req, res, authOptions);

  let createdBy = '';

  if (createdByRole === USER_ROLE.DRIVER) {
    const driverCreate: any = await prisma.driver.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    createdBy = `Driver - ${driverCreate.name}`;
  } else if (
    createdByRole === USER_ROLE.ADMIN ||
    createdByRole === USER_ROLE.CLIENT
  ) {
    const userCreate: any = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (userCreate.role === USER_ROLE.ADMIN) {
      createdBy = `Admin - ${userCreate.clientName}`;
    }

    if (userCreate.role === USER_ROLE.CLIENT) {
      createdBy = `Client - ${userCreate.clientId}`;
    }
  }

  return createdBy;
};
