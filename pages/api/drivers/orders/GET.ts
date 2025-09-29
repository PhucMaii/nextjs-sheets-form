import {
  OrderedItems,
  PrismaClient,
  Reassignment,
  ReassignmentStatus,
  Route,
  UserRoute,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { days } from '@/app/lib/constant';
import { convertDeliveryDateStringToDate } from '../../utils/date';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { generateManifest } from '../../utils/overview';
import { getOrderRoute } from '../../admin/[companyId]/orders/GET';
import { IReassignment } from '@/app/utils/type';

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

    const existingDriver = await prisma.employee.findUnique({
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
      return res.status(200).json({
        data: {
          employee: existingDriver,
          deliveryOrders: [],
          manifest: {},
          codAmount: 0,
        },
      });
    }

    const userIds = targetRoute?.clients.map((userRoute: UserRoute) => {
      return userRoute.userId;
    });

    const deliveryOrders = await prisma.orders.findMany({
      where: {
        deliveryDate,
        status: {
          not: ORDER_STATUS.VOID,
        },
        userId: {
          in: userIds,
        },
        companyId: session?.user?.companyId,
      },
      include: {
        user: {
          include: {
            preference: true,
            category: true,
            routes: true,
          },
        },
        delivery: {
          include: {
            medias: true,
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

    const arrangedOrders: any = await prisma.scheduleOrders.findMany({
      where: {
        userId: {
          in: userIds,
        },
        day,
        companyId: session?.user?.companyId,
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

    // Retrieve any reassignment orders go to current route
    const reassignmentOrders: any[] = await prisma.reassignment.findMany({
      where: {
        date: deliveryDate,
        toRouteId: targetRoute.id,
      },
      include: {
        order: {
          include: {
            user: {
              include: {
                preference: true,
                category: true,
                routes: true,
              },
            },
            delivery: {
              include: {
                medias: true,
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
        },
      },
    });

    // Retrieve any reassignment orders go away from current route
    const reassignmentOrdersAwayFromCurrentRoute: any[] =
      await prisma.reassignment.findMany({
        where: {
          date: deliveryDate,
          fromRouteId: targetRoute.id,
        },
        include: {
          order: {
            include: {
              user: {
                include: {
                  preference: true,
                  category: true,
                  routes: true,
                },
              },
              delivery: {
                include: {
                  medias: true,
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
          },
        },
      });

    // Filter pending and accepted reassignment orders
    const pendingReassignmentOrders = reassignmentOrders
      .filter((reassignmentOrder: IReassignment) => {
        return reassignmentOrder.status === ReassignmentStatus.PENDING;
      })
      .map((reassignmentOrder: IReassignment) => {
        const { order, ...reassignment } = reassignmentOrder;
        return {
          ...order,
          orderRoute: getOrderRoute(reassignmentOrder.order),
          reassignment: reassignment,
        };
      });
    const acceptedReassignmentOrders = reassignmentOrders.filter(
      (reassignmentOrder: Reassignment) => {
        return reassignmentOrder.status === ReassignmentStatus.ACCEPTED;
      },
    );

    // Insert the reassignment orders into the arrangedOrders
    for (const reassignmentOrder of acceptedReassignmentOrders) {
      const { order, ...reassignment } = reassignmentOrder;
      arrangedOrders.splice(reassignmentOrder.index, 0, {
        order: order,
        isReassignment: true,
        reassignment: reassignment,
      });
    }

    // Format the return orders
    const sortedDeliveryOrders = [];
    for (const order of arrangedOrders) {
      // If the order is a reassignment order go away from current route, skip it -> remove it from the arrangedOrders
      if (
        reassignmentOrdersAwayFromCurrentRoute.some(
          (reassignmentOrder: IReassignment) =>
            reassignmentOrder.order.userId === order.order.userId,
        )
      ) {
        continue;
      }

      // If the order is a reassignment order, add it to the sortedDeliveryOrders
      if (order.isReassignment) {
        const orderRoute = getOrderRoute(order.order);
        sortedDeliveryOrders.push({
          ...order.order,
          items: order.order.items.map((item: OrderedItems) => {
            const totalPrice = item.quantity * item.price;
            return { ...item, totalPrice };
          }),
          isReassignment: true,
          reassignment: order.reassignment,
          orderRoute,
        });
        continue;
      }

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
    const codAmount = deliveryOrders.reduce((acc: number, order: any) => {
      if (order?.user?.preference?.paymentType === PAYMENT_TYPE.COD) {
        return acc + order.totalPrice;
      } else {
        return acc;
      }
    }, 0);

    return res.status(200).json({
      data: {
        employee: existingDriver,
        deliveryOrders: sortedDeliveryOrders,
        pendingReassignmentOrders,
        acceptedReassignmentOrders,
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
