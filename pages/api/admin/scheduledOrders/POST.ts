import { PrismaClient, ScheduleOrders } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId, items, day, routeId, newTotalPrice } = req.body;

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
          },
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    if (existingUser.scheduleOrders.length > 0) {
      const sameDayOrder = existingUser.scheduleOrders.find(
        (order: ScheduleOrders) => {
          return order.day === day;
        },
      );

      // Override same day schedule order if it existed
      if (sameDayOrder) {
        for (const item of items) {
          // first, find if there is any of that item
          const existedItem = await prisma.orderedItems.findFirst({
            where: {
              scheduledOrderId: sameDayOrder.id,
              name: item.name,
            },
          });

          // if yes, then update it, otherwise create new items
          if (existedItem) {
            await prisma.orderedItems.updateMany({
              where: {
                scheduledOrderId: sameDayOrder.id,
                name: item.name,
              },
              data: {
                price: item.price,
                quantity: item.quantity,
              },
            });
          } else {
            await prisma.orderedItems.create({
              data: {
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                scheduledOrderId: sameDayOrder.id,
              },
            });
          }
        }

        // update schedule order
        const updatedScheduleOrder = await prisma.scheduleOrders.update({
          where: {
            id: sameDayOrder.id,
          },
          data: {
            totalPrice: newTotalPrice,
          },
          include: {
            items: true,
            user: true,
          },
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

        return res.status(200).json({
          data: updatedScheduleOrder,
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

    // Create items for the schedule order
    for (const item of items) {
      const existedItem = await prisma.orderedItems.findMany({
        where: {
          name: item.name,
          scheduledOrderId: newScheduleOrder.id,
        },
      });

      if (existedItem.length > 0) {
        return res.status(500).json({
          error: `Item ${item.name} already existed in schedule order ${newScheduleOrder.id}`,
        });
      }

      await prisma.orderedItems.create({
        data: {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          scheduledOrderId: newScheduleOrder.id,
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
