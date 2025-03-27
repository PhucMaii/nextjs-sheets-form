import { ScheduledOrder } from '@/app/utils/type';
import {
  PositionIndex,
  PrismaClient,
  ScheduleOrders,
  UserRoute,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId, items, day, routeId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        scheduleOrders: {
          where: {
            userId,
            day,
          },
          include: {
            items: true,
            positionIndex: true,
          },
        },
        routes: {
          include: {
            route: true,
          },
        },
      },
    });

    const allRoutes = await prisma.route.findMany({
      include: {
        clients: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    const newTotalPrice = items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0,
    );

    if (existingUser.scheduleOrders.length > 0) {
      const sameDayOrder = existingUser.scheduleOrders.find(
        (order: ScheduleOrders) => {
          return order.day === day;
        },
      );

      // Override same route schedule order if it existed
      if (sameDayOrder) {
        // Create schedule order for that day
        const newScheduleOrder = await prisma.scheduleOrders.create({
          data: {
            userId,
            totalPrice: newTotalPrice,
            day,
          },
        });

        // Create position index for added pre order
        // If owner/client of new order existed in selected route -> use prev index
        // If owner/client of new order does not exist in selected route -> get the last index of that route
        // Should have a test to check if any scheduledOrder has position index of -1 -> bugs
        const routeScheduledOrders = await getRouteScheduledOrders(routeId);
        const sameRouteOrder = routeScheduledOrders.find(
          (scheduledOrder: ScheduledOrder) => scheduledOrder.userId === userId,
        );

        // If owner/client of new order does not exist in selected route -> refactor arrangement of other route
        if (!sameRouteOrder) {
          // Get prev route
          const prevRoute = existingUser.routes.find(
            (route: any) => route.route.day === day,
          );

          if (prevRoute) {
            await refactorRouteArrangement(prevRoute.route.id);
          }
        }

        await prisma.positionIndex.create({
          data: {
            index: sameRouteOrder
              ? sameRouteOrder.positionIndex.index
              : routeScheduledOrders.length,
            scheduledOrderId: newScheduleOrder.id,
          },
        });

        // Create items for added pre order
        await prisma.orderedItems.createMany({
          data: items.map((item: any) => ({
            name: item.name,
            price: item.price,
            isShowDiscount: item?.isShowDiscount,
            prevPrice: item?.prevPrice,
            quantity: item.quantity,
            optionId: item?.optionId,
            inventoryItemId: item.inventoryItemId,
            inventoryUnitId: item?.option?.unitId || item.inventoryUnitId,
            scheduledOrderId: newScheduleOrder.id,
          })),
        });

        // Delete previous schedule order
        await prisma.scheduleOrders.delete({
          where: {
            id: sameDayOrder.id,
          },
        });

        const userRouteIds = existingUser.routes.map(
          (route: any) => route.routeId,
        );
        // Find the route of the same day order
        const routeOnSameDay = allRoutes.find((route) => {
          return (
            route.day === sameDayOrder.day && userRouteIds.includes(route.id)
          );
        });

        if (routeOnSameDay) {
          await prisma.userRoute.delete({
            where: {
              userId_routeId: {
                userId: userId,
                routeId: routeOnSameDay.id,
              },
            },
          });
        }

        // check then add target client into selected route
        const clientInUserRoute = await prisma.userRoute.findUnique({
          where: {
            userId_routeId: {
              userId: Number(userId),
              routeId: Number(routeId),
            },
          },
        });

        if (!clientInUserRoute) {
          await prisma.userRoute.create({
            data: {
              userId: Number(userId),
              routeId: Number(routeId),
            },
          });
        }

        return res.status(200).json({
          // data: updatedScheduleOrder,
          message: 'Override Schedule Order Successfully',
        });
      }
    }

    // Create schedule order for that day
    const newScheduleOrder = await prisma.scheduleOrders.create({
      data: {
        userId,
        totalPrice: newTotalPrice,
        day,
      },
    });

    // TEMPORARY: Get numbers of orders in that route and place newly added order at the last item
    const routeScheduledOrders = await getRouteScheduledOrders(Number(routeId));

    // Create position index for added pre order
    await prisma.positionIndex.create({
      data: {
        scheduledOrderId: newScheduleOrder.id,
        index: routeScheduledOrders.length, // Last index
      },
    });

    const newItems = items.map((item: any) => {
      return {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isShowDiscount: item?.isShowDiscount,
        optionId: item?.optionId,
        prevPrice: item?.prevPrice,
        scheduledOrderId: newScheduleOrder.id,
        inventoryItemId: item.inventoryItemId,
        inventoryUnitId: item?.option?.unitId || item.inventoryUnitId,
      };
    });

    await prisma.orderedItems.createMany({
      data: newItems,
    });
    // check then add target client into selected route
    const clientInUserRoute = await prisma.userRoute.findUnique({
      where: {
        userId_routeId: {
          userId: Number(userId),
          routeId: Number(routeId),
        },
      },
    });

    if (!clientInUserRoute) {
      await prisma.userRoute.create({
        data: {
          userId: Number(userId),
          routeId: Number(routeId),
        },
      });
    }

    const updatedScheduledOrder = await prisma.scheduleOrders.findUnique({
      where: {
        id: newScheduleOrder.id,
      },
      include: {
        items: true,
        user: true,
      },
    });

    return res.status(201).json({
      data: updatedScheduledOrder,
      message: 'New Schedule Order Created',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const getRouteScheduledOrders = async (routeId: number) => {
  try {
    const prisma = new PrismaClient();

    const route = await prisma.route.findUnique({
      where: {
        id: routeId,
      },
      include: {
        clients: {
          include: {
            user: {
              include: {
                scheduleOrders: {
                  include: {
                    user: true,
                    positionIndex: true,
                    items: {
                      include: {
                        inventoryItem: true,
                        inventoryUnit: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!route) {
      console.log('Route Not Found');
      throw new Error('Route Not Found');
    }

    if (route.clients.length === 0) {
      return [];
    }

    // Get all scheduled orders in selected route
    const scheduledOrders = route.clients.map((client: UserRoute | any) => {
      if (client.user.scheduleOrders.length === 0) {
        return null;
      }

      // Access to client to get all scheduled orders
      // Then find the one has same day as route day
      const routePreOrder = client.user.scheduleOrders.find(
        (scheduledOrder: ScheduledOrder) => {
          return scheduledOrder.day === route.day;
        },
      );

      return routePreOrder;
    });

    return scheduledOrders;
  } catch (error: any) {
    throw new Error('Error getting route scheduled orders', error);
  }
};
export const refactorRouteArrangement = async (routeId: number) => {
  try {
    const prisma = new PrismaClient();

    const routeScheduledOrders = await getRouteScheduledOrders(routeId);

    if (routeScheduledOrders.length === 0) {
      return null;
    }

    // Get all position index of fetched scheduled orders and sort it
    const sortedPosIndexList = routeScheduledOrders
      .map((scheduledOrder: ScheduledOrder) => {
        return scheduledOrder.positionIndex;
      })
      .sort(
        (posIndexA: PositionIndex, posIndexB: PositionIndex) =>
          posIndexA.index - posIndexB.index,
      );

    // Get the correct position index
    const newPosIndexList = sortedPosIndexList.map(
      (posIndex: PositionIndex, index: number) => {
        return { index, scheduledOrderId: posIndex.scheduledOrderId };
      },
    );

    // Delete all the old position index
    await prisma.positionIndex.deleteMany({
      where: {
        id: {
          in: sortedPosIndexList.map((posIndex: PositionIndex) => posIndex.id),
        },
      },
    });

    // Create new position index
    await prisma.positionIndex.createMany({
      data: newPosIndexList,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Error in refactoring route arrangement: ', error);
  }
};
