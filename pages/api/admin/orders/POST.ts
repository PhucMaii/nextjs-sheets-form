import { ORDER_STATUS } from '@/app/utils/enum';
import { generateCurrentTime } from '@/app/utils/time';
import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkHasClientOrder } from '../../import-sheets';
import { OrderedItems, ScheduledOrder, UserType } from '@/app/utils/type';
import { sendEmail } from '../../utils/email';
import { pusherServer } from '@/app/pusher';

interface BodyTypes {
  deliveryDate: string;
  scheduleOrderList: ScheduledOrder[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { deliveryDate, scheduleOrderList } = req.body as BodyTypes;

    const isSendToAdmin = false;
    const updatedOrderList: any = [];

    for (const scheduleOrder of scheduleOrderList) {
      // Check has user order for today, if yes then skip that client
      const hasClientOrder = await checkHasClientOrder(scheduleOrder.user.id, deliveryDate);
      if (hasClientOrder) {
        await pusherServer.trigger('admin-schedule-order', 'pre-order', hasClientOrder);
        continue;
      }

      const newOrder: any = await createOrder(
        scheduleOrder.user,
        scheduleOrder.items,
        scheduleOrder.totalPrice,
        deliveryDate,
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
      }
    });

    return updatedOrder;
  } catch (error: any) {
    console.log('Internal Server Error - Fail to create order: ', error);
  }
};