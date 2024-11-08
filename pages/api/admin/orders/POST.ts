import { ORDER_STATUS } from '@/app/utils/enum';
import { generateCurrentTime } from '@/app/utils/time';
import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkHasClientOrder } from '../../import-sheets';
import { OrderedItems, ScheduledOrder, UserType } from '@/app/utils/type';
import { sendEmail } from '../../utils/email';
import { pusherServer } from '@/app/pusher';
import { normalizeDate } from '../../utils/date';
import { getUserInfo } from '../../utils/auth';

interface BodyTypes {
  deliveryDate: string;
  scheduleOrderList: ScheduledOrder[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { deliveryDate, scheduleOrderList } = req.body as BodyTypes;

    const isSendToAdmin = false;
    const updatedOrderList: any = [];

    for (const scheduleOrder of scheduleOrderList) {
      if (scheduleOrder.totalPrice === 0) {
        await pusherServer?.trigger(
          'admin-schedule-order',
          'pre-order',
          scheduleOrder,
        );
        console.log({ zeroTotalPrice: scheduleOrder });
        continue;
      }
      // Check has user order for today, if yes then skip that client
      const existingOrder: any = await checkHasClientOrder(
        scheduleOrder.user.id,
        deliveryDate,
      );

      if (existingOrder) {
        await pusherServer?.trigger(
          'admin-schedule-order',
          'pre-order',
          existingOrder,
        );
        console.log({ alreadyOrder: scheduleOrder });
        continue;
      }

      // Check is user has time off
      const unavailableRanges = await prisma.dayRange.findMany({
        where: {
          userId: scheduleOrder.userId,
        },
      });

      let trackIndex = 0;
      const deliveryDateTypeDate = normalizeDate(new Date(deliveryDate));
      for (const unavailableRange of unavailableRanges) {
        const normalizedStartDate = normalizeDate(unavailableRange.startDate);
        const normalizedEndDate = normalizeDate(unavailableRange.endDate);

        normalizedEndDate.setDate(normalizedEndDate.getDate() - 1);
        if (
          deliveryDateTypeDate >= normalizedStartDate &&
          deliveryDateTypeDate <= normalizedEndDate
        ) {
          break;
        }
        trackIndex++;
      }

      if (trackIndex <= unavailableRanges.length - 1) {
        await pusherServer?.trigger(
          'admin-schedule-order',
          'pre-order',
          scheduleOrder,
        );
        console.log({ unavailableTime: scheduleOrder });
        continue;
      }

      // Get person create info
      const adminCreate: any = await getUserInfo(req, res);

      const newOrder: any = await createOrder(
        scheduleOrder.user,
        scheduleOrder.items,
        deliveryDate,
        `Admin - ${adminCreate.clientName}`,
      );

      await sendEmail(
        scheduleOrder.user,
        scheduleOrder.items,
        newOrder.id,
        deliveryDate,
        isSendToAdmin,
      );
      updatedOrderList.push(newOrder);

      await pusherServer?.trigger(
        'admin-schedule-order',
        'pre-order',
        newOrder,
      );
      console.log({ successful: scheduleOrder });
    }

    return res.status(201).json({
      data: updatedOrderList,
      message: 'Pre Order Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error.message,
    });
  }
}

const createOrder = async (
  user: User | UserType,
  items: OrderedItems[],
  deliveryDate: string,
  createdBy: string,
) => {
  try {
    const prisma = new PrismaClient();

    const orderTime = generateCurrentTime();

    const totalPrice = items.reduce((acc: number, item: OrderedItems) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    // initialize order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate,
        note: '',
        status: ORDER_STATUS.INCOMPLETED,
        userId: user.id,
        totalPrice,
        orderTime,
        createdBy,
      },
    });

    const inventoryItemQuantityMap: any = {};
    const itemsToCreate = items.map((item: OrderedItems) => {

      if (inventoryItemQuantityMap[item?.inventoryItemId || -1]) {
        inventoryItemQuantityMap[item?.inventoryItemId || -1] += item.quantity;
      } else {
        inventoryItemQuantityMap[item?.inventoryItemId || -1] = item.quantity;
      }

      return {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        orderId: newOrder.id,
        inventoryItemId: item.inventoryItemId,
      };
    });

    await prisma.orderedItems.createMany({
      data: itemsToCreate
    });

    // update inventory item quantity
    const inventoryItems: any = await prisma.inventoryItem.findMany({
      where: {
        id: {
          in: Object.keys(inventoryItemQuantityMap).map((itemId: string) => Number(itemId)),
        },
      },
    });

    for (const inventoryItem of inventoryItems) {
      console.log({inventoryItem});
      if (inventoryItemQuantityMap[inventoryItem.id]) {
        await prisma.inventoryItem.update({
          where: {
            id: inventoryItem.id,
          },
          data: {
            quantity: inventoryItem.quantity - inventoryItemQuantityMap[inventoryItem.id],
          },
        });
      }
    }

    const updatedOrder = await prisma.orders.findUnique({
      where: {
        id: newOrder.id,
      },
      include: {
        items: true,
      },
    });

    return updatedOrder;
  } catch (error: any) {
    console.log('Internal Server Error - Fail to create order: ', error);
  }
};
