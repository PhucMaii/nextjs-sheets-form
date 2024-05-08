import { ORDER_STATUS, ORDER_TYPE } from '@/app/utils/enum';
import { generateCurrentTime } from '@/app/utils/time';
import { OrderedItems, PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkHasClientOrder } from '../../import-sheets';
import { UserType } from '@/app/utils/type';
import { sendEmail } from '../../utils/email';

interface BodyTypes {
  deliveryDate: string;
  clientList?: UserType[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { deliveryDate, clientList } = req.body as BodyTypes;

    let clients: any = [];

    // Check if request provide client list
    if (clientList) {
      clients = [...clientList];
    } else {
      clients = await prisma.user.findMany({
        where: {
          preference: {
            orderType: ORDER_TYPE.FIXED,
          },
        },
      });
    }

    const updatedOrderList: any = [];

    for (const user of clients) {
      if (!user.scheduleOrdersId) {
        return res.status(500).json({
          error: `Pre order stop at user ${user.clientId} because they do not have schedule order id `,
        });
      }

      // Check has user order for today, if yes then skip that client
      const hasClientOrder = await checkHasClientOrder(user.id, deliveryDate);
      if (hasClientOrder) {
        continue;
      }

      // get user schedule order
      const scheduleOrder = await prisma.scheduleOrders.findUnique({
        where: {
          id: user.scheduleOrdersId,
        },
        include: {
          items: true,
        },
      });

      // Need to handle the miss schedule order
      if (!scheduleOrder) {
        return res.status(500).json({
          error: `Pre order stop at user ${user.clientId} because they do not have scheduled order `,
        });
      }

      const updatedOrder: any = await createOrder(
        user,
        scheduleOrder.items,
        scheduleOrder.totalPrice,
        deliveryDate,
      );

      await sendEmail(
        user,
        scheduleOrder.items,
        updatedOrder.id,
        deliveryDate,
        false,
      );
      updatedOrderList.push(updatedOrder);
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
  user: User,
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
    });

    return updatedOrder;
  } catch (error: any) {
    console.log('Internal Server Error - Fail to create order: ', error);
  }
};
