import { PrismaClient, ScheduleOrders, UserRoute } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export enum DELETE_OPTION {
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent',
}

interface BodyTypes {
  scheduleOrderId?: string;
  scheduleOrderList?: ScheduleOrders[];
  deleteOption?: DELETE_OPTION;
  routeId?: number;
  userId?: number;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const {
      scheduleOrderId,
      scheduleOrderList,
      deleteOption,
      routeId,
      userId,
    } = req.body as BodyTypes;

    // get all clients from selected route
    const selectedRoute = await prisma.route.findUnique({
      where: {
        id: routeId,
      },
      include: {
        clients: true,
      },
    });

    // check is clients in route
    const isClientInRoute = selectedRoute?.clients.find(
      (userRoute: UserRoute) => userRoute.userId === userId,
    );

    if (!isClientInRoute) {
      return res.status(404).json({
        error: `Selected Client Does Not Exist In Route Id ${routeId}`,
      });
    }

    if (routeId && userId) {
      await prisma.userRoute.delete({
        where: {
          userId_routeId: {
            userId,
            routeId,
          },
        },
      });
    }

    if (deleteOption === DELETE_OPTION.TEMPORARY) {
      return res.status(200).json({
        message: `Client Removed From Route Id ${routeId} Successfully`,
      });
    }

    if (scheduleOrderList) {
      for (const order of scheduleOrderList) {
        const existingOrder = await prisma.scheduleOrders.findUnique({
          where: {
            id: Number(order.id),
          },
        });

        if (!existingOrder) {
          return res.status(404).json({
            error: 'Order Not Found',
          });
        }

        await prisma.scheduleOrders.delete({
          where: {
            id: Number(order.id),
          },
        });
      }
    } else if (scheduleOrderId) {
      const existingOrder = await prisma.scheduleOrders.findUnique({
        where: {
          id: Number(scheduleOrderId),
        },
      });

      if (!existingOrder) {
        return res.status(404).json({
          error: 'Order Not Found',
        });
      }

      await prisma.scheduleOrders.delete({
        where: {
          id: Number(scheduleOrderId),
        },
      });
    } else {
      return res.status(500).json({
        error:
          'Please provide either schedule order list or schedule order id to be deleted',
      });
    }

    return res.status(200).json({
      message: 'Schedule Order Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
