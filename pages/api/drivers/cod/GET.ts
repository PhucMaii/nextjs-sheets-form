import { OrderedItems, PrismaClient, UserRoute } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../../utils/auth';
import { convertDeliveryDateStringToDate } from '../../utils/date';
import { days } from '@/app/lib/constant';

interface IQuery {
  date?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { date } = req.query as IQuery;

    if (!date) {
      return res.status(404).json({ error: 'You are missing body data' });
    }

    const currentDriver = await getDriverInfo(req, res);

    if (!currentDriver) {
      return res.status(404).json({ error: 'Driver Not Found' });
    }

    const formattedDate: Date = convertDeliveryDateStringToDate(date);
    const day = days[formattedDate.getDay()];

    const cod: any = await prisma.codBoard.findFirst({
      where: {
        date,
        driverId: currentDriver.id,
      },
      include: {
        orders: {
          include: {
            user: {
              include: {
                category: true,
                preference: true,
                routes: true,
              },
            },
            items: true,
          },
        },
      },
    });

    if (!cod) {
      return res.status(404).json({
        error: 'COD not found',
      });
    }

    const targetRoute = currentDriver.routes.find((route: any) => {
      return route.day === day;
    });
    if (!targetRoute) {
      return res.status(404).json({ error: 'Route Not Found' });
    }

    const userIds = targetRoute?.clients.map((userRoute: UserRoute) => {
      return userRoute.userId;
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
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
            fifo: true,
          },
        },
        positionIndex: true,
      },
      orderBy: {
        positionIndex: {
          index: 'asc',
        },
      },
    });

    // Format the return orders
    const sortedDeliveryOrders = [];
    for (const order of arrangedOrders) {
      const deliveryOrder = cod.orders.find(
        (browsingOrder: any) => browsingOrder.userId === order.userId,
      );

      if (!deliveryOrder) {
        continue;
      }

      const newItems = deliveryOrder.items.map((item: OrderedItems) => {
        const totalPrice = item.quantity * item.price;
        return { ...item, totalPrice };
      });

      const isOrderIncludedInRoute = deliveryOrder.user.routes.some(
        (route: UserRoute) => route.routeId === targetRoute.id,
      );
      sortedDeliveryOrders.push({
        ...deliveryOrder,
        items: newItems,
        notInRoute: !isOrderIncludedInRoute,
      });
    }

    // const formattedOrders = cod?.orders.map((order: any) => {
    //     const isOrderIncludedInRoute = order.user.routes.some((route: UserRoute) => route.routeId === targetRoute.id);

    //     return {
    //         ...order,
    //         notInRoute: !isOrderIncludedInRoute
    //     }
    // });

    console.log(sortedDeliveryOrders, 'formattedOrders');

    return res.status(200).json({
      data: { ...cod, orders: sortedDeliveryOrders },
      message: 'Fetch All Cod Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
