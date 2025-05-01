import { OrderedItems, PrismaClient, UserRoute } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../../utils/auth';
import {
  convertDeliveryDateStringToDate,
  generate7DaysBefore,
} from '../../utils/date';
import { days } from '@/app/lib/constant';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { getWCODDay } from '@/app/utils/time';

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

    const codBoard: any = await prisma.codBoard.findFirst({
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
            items: {
              include: {
                inventoryItem: true,
                inventoryUnit: true,
              },
            },
          },
        },
      },
    });

    // Get cod orders on that day

    if (!codBoard) {
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

    // Get cod orders on that day from that route
    const orderExistedInBoard = codBoard.orders.map((order: any) => {
      return order.id;
    });

    const wcodDay: any = getWCODDay(date);
    const wcod7days = generate7DaysBefore(date);
    const codOrders = await prisma.orders.findMany({
      where: {
        id: {
          notIn: orderExistedInBoard,
        },
        deliveryDate: date,
        status: {
          in: [
            ORDER_STATUS.INCOMPLETED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.COMPLETED,
          ],
        },
        userId: {
          in: userIds,
        },
        user: {
          preference: {
            paymentType: PAYMENT_TYPE.COD,
          },
        },
      },
      include: {
        user: {
          include: {
            preference: true,
            category: true,
            routes: true,
          },
        },
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
            fifo: true,
          },
        },
      },
    });

    const wcodOrders = await prisma.orders.findMany({
      where: {
        id: {
          notIn: orderExistedInBoard,
        },
        deliveryDate: {
          in: wcod7days,
        },
        status: {
          in: [
            ORDER_STATUS.INCOMPLETED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.COMPLETED,
          ],
        },
        userId: {
          in: userIds,
        },
        user: {
          preference: {
            paymentType: wcodDay,
          },
        },
      },
      include: {
        user: {
          include: {
            preference: true,
            category: true,
            routes: true,
          },
        },
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
            fifo: true,
          },
        },
      },
    });

    // Merge both cod orders and board orders
    const mergedOrders = [...codOrders, ...wcodOrders, ...codBoard.orders];

    // Format the return orders
    const sortedDeliveryOrders = [];
    for (const order of mergedOrders) {
      // const deliveryOrder = mergedOrders.find(
      //   (browsingOrder: any) => browsingOrder.userId === order.userId,
      // );

      // if (!deliveryOrder) {
      //   continue;
      // }

      const newItems = order.items.map((item: OrderedItems) => {
        const totalPrice = item.quantity * item.price;
        return { ...item, totalPrice };
      });

      const isOrderIncludedInRoute = order.user.routes.some(
        (route: UserRoute) => route.routeId === targetRoute.id,
      );
      sortedDeliveryOrders.push({
        ...order?.user,
        ...order,
        items: newItems,
        notInBoard: !orderExistedInBoard.includes(order.id),
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

    // Sort the orders: if orders.deliveryDate !== date, push it first
    const sortedOrders = sortedDeliveryOrders.sort((a) => {
      if (a.deliveryDate !== date) {
        return -1;
      }
      return 1;
    });

    return res.status(200).json({
      data: { ...codBoard, orders: sortedOrders },
      message: 'Fetch All Cod Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
