import {
  OrderedItems,
  Orders,
  PrismaClient,
  Route,
  UserRoute,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { days } from '@/app/lib/constant';
import { convertDeliveryDateStringToDate } from '../../utils/date';
import { generateManifest } from '../../admin/orders/overview';
import { ORDER_STATUS } from '@/app/utils/enum';

interface IQuery {
  deliveryDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { deliveryDate }: IQuery = req.query;

    if (!deliveryDate) {
      return res.status(404).json({
        error: 'Delivery Date Is Missing',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);

    const existingDriver = await prisma.driver.findUnique({
      where: {
        id: Number(session?.user?.id),
      },
      include: {
        routes: {
          include: {
            clients: true,
          },
        },
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }

    const date = convertDeliveryDateStringToDate(deliveryDate);
    const day = days[date.getDay()];

    const targetRoute = existingDriver.routes.find((route: Route) => {
      return route.day === day;
    });

    if (!targetRoute) {
      return res.status(400).json({
        data: {
          driver: existingDriver,
          deliveryOrders: [],
          manifest: {},
          codAmount: 0,
        },
      })
    }

    const userIds = targetRoute?.clients.map((userRoute: UserRoute) => {
      return userRoute.userId;
    });

    const deliveryOrders = await prisma.orders.findMany({
      where: {
        userId: {
          in: userIds,
        },
        deliveryDate,
        status: {
          in: [
            ORDER_STATUS.INCOMPLETED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.COMPLETED,
          ],
        },
      },
      include: {
        user: {
          include: {
            preference: true,
            category: true,
          },
        },
        items: true,
      },
    });

    const arrangedOrders = await prisma.scheduleOrders.findMany({
      where: {
        userId: {
          in: userIds,
        },
        day,
      },
      include: {
        user: true,
      },
    });

    const sortedDeliveryOrders = [];
    for (const order of arrangedOrders) {
      const deliveryOrder = deliveryOrders.find(
        (browsingOrder: any) => browsingOrder.userId === order.userId,
      );

      if (!deliveryOrder) {
        continue;
      }

      const newItems = deliveryOrder.items.map((item: OrderedItems) => {
        const totalPrice = item.quantity * item.price;
        return { ...item, totalPrice };
      });
      sortedDeliveryOrders.push({
        ...deliveryOrder.user,
        ...deliveryOrder,
        items: newItems,
      });
    }

    const manifest = generateManifest(deliveryOrders);
    const codAmount = deliveryOrders.reduce((acc: number, order: Orders) => {
      return acc + order.totalPrice;
    }, 0);

    return res.status(200).json({
      data: {
        driver: existingDriver,
        deliveryOrders: sortedDeliveryOrders,
        manifest,
        codAmount,
      },
      message: 'Fetch Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
