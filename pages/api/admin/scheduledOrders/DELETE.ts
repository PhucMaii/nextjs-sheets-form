import { PrismaClient, ScheduleOrders } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  scheduleOrderId?: string;
  scheduleOrderList?: ScheduleOrders[];
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { scheduleOrderId, scheduleOrderList } = req.body as BodyTypes;

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
