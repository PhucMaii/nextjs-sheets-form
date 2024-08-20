import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { generateCurrentTime } from '@/app/utils/time';
import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkHasClientOrder } from '../../import-sheets';
import { OrderedItems, ScheduledOrder, UserType } from '@/app/utils/type';
import { sendEmail } from '../../utils/email';
import { pusherServer } from '@/app/pusher';
import { convertDeliveryDateStringToDate } from '../../utils/date';
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
        await pusherServer.trigger(
          'admin-schedule-order',
          'pre-order',
          scheduleOrder,
        );
        console.log({ zeroTotalPrice: scheduleOrder });
        continue;
      }
      // Check has user order for today, if yes then skip that client
      const existingOrder = await checkHasClientOrder(
        scheduleOrder.user.id,
        deliveryDate,
      );

      const createdBy = existingOrder?.createdBy?.split(' - ')[0];
      if (createdBy === USER_ROLE.CLIENT || createdBy === USER_ROLE.DRIVER) {
        await pusherServer.trigger(
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
          userId: scheduleOrder.userId
        }
      });

      let trackIndex = 0;
      const deliveryDateTypeDate = convertDeliveryDateStringToDate(deliveryDate);
      for (const unavailableRange of unavailableRanges) {
        const startDate = new Date(unavailableRange.startDate);
        const endDate = new Date(unavailableRange.endDate);

        if (deliveryDateTypeDate >= startDate && deliveryDateTypeDate <= endDate) {
          break;
        }
        trackIndex++;
      }

      if (trackIndex <= unavailableRanges.length - 1) {
        await pusherServer.trigger(
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
        scheduleOrder.totalPrice,
        deliveryDate,
        `Admin - ${adminCreate.clientName}`
      );

      await sendEmail(
        scheduleOrder.user,
        scheduleOrder.items,
        newOrder.id,
        deliveryDate,
        isSendToAdmin,
      );
      updatedOrderList.push(newOrder);

      await pusherServer.trigger('admin-schedule-order', 'pre-order', newOrder);
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
  totalPrice: number,
  deliveryDate: string,
  createdBy: string
) => {
  try {
    const prisma = new PrismaClient();

    const orderTime = generateCurrentTime();
    // initialize order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate,
        note: '',
        status: ORDER_STATUS.INCOMPLETED,
        userId: user.id,
        totalPrice,
        orderTime,
        createdBy
      },
    });

    for (const item of items) {
      await prisma.orderedItems.create({
        data: {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          orderId: newOrder.id,
        },
      });
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
