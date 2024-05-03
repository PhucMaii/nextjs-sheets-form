import { OrderedItems } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  items: OrderedItems[];
  scheduledOrderId: number;
  totalPrice: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { items, scheduledOrderId, totalPrice } = req.body as BodyTypes;

    // Update items in schedule order
    for (const item of items) {
      const targetItem = await prisma.orderedItems.findUnique({
        where: {
          id: item.id,
        },
      });

      if (!targetItem) {
        return res.status(404).json({
          error: `Item ${item.id} Not Found`,
        });
      }

      await prisma.orderedItems.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: item.quantity,
        },
      });
    }

    // Check if schedule order id is right
    const existingScheduleOrder = await prisma.scheduleOrders.findUnique({
      where: {
        id: scheduledOrderId,
      },
    });

    if (!existingScheduleOrder) {
      return res.status(404).json({
        error: `Schedule Order ${scheduledOrderId} Not Found`,
      });
    }

    // Apply new total price on schedule order
    const updatedScheduledOrder = await prisma.scheduleOrders.update({
      where: {
        id: scheduledOrderId,
      },
      data: {
        totalPrice,
      },
    });

    return res.status(200).json({
      data: updatedScheduledOrder,
      message: 'Scheduled Order Updated Succesfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
