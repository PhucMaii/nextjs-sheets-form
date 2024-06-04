import { ScheduledOrder } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  removedOrderIdList: number[];
  updatedOrderList: ScheduledOrder[];
}

export default async function reArrangement(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { removedOrderIdList, updatedOrderList }: BodyTypes = req.body;

    // Remove all the scheduled order related in that route
    for (const id of removedOrderIdList) {
      await prisma.scheduleOrders.delete({
        where: {
          id,
        },
      });
    }

    // Add scheduled order back with new id from client
    for (const scheduledOrder of updatedOrderList) {
      await prisma.scheduleOrders.create({
        data: {
          id: scheduledOrder.id,
          userId: scheduledOrder.userId,
          totalPrice: scheduledOrder.totalPrice,
          day: scheduledOrder.day,
        },
      });

      const newItems = scheduledOrder.items.map((item: any) => {
        return {
          name: item.name,
          price: item.price,
          quantity: item.quantity, 
          scheduledOrderId: scheduledOrder.id 
        };
      });

      await prisma.orderedItems.createMany({
        data: newItems,
      });
    }

    return res.status(200).json({
      message: 'Rearrange Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
