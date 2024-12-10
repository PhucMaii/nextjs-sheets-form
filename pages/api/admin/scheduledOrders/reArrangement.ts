// import { ScheduledOrder } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  removedOrderIdList: number[];
  updatedOrderList: {id: number, newId: number}[];
}

export default async function reArrangement(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { removedOrderIdList, updatedOrderList }: BodyTypes = req.body;

    // Remove all the scheduled order related in that route
    const updatedOrders = await prisma.scheduleOrders.findMany({
      where: {
        id: {
          in: removedOrderIdList,
        },
      },
      include: {
        items: true,
      },
    });

    await prisma.scheduleOrders.deleteMany({
      where: {
        id: {
          in: removedOrderIdList,
        },
      },
    });

    // for (const id of removedOrderIdList) {
    //   await prisma.scheduleOrders.delete({
    //     where: {
    //       id,
    //     },
    //   });
    // }

    // Add scheduled order back with new id from client
    const returnData: any = [];
    for (const scheduledOrder of updatedOrderList) {
      const targetOrder = updatedOrders.find(
        (order: any) => order.id === scheduledOrder.id,
      );

      if (!targetOrder) {
        console.error('Target order not found');
        continue; 
      }

      const updatedScheduleOrder = await prisma.scheduleOrders.create({
        data: {
          id: scheduledOrder.newId,
          userId: targetOrder.userId,
          totalPrice: targetOrder.totalPrice,
          day: targetOrder.day,
        },
        include: {
          user: true,
        },
      });

      const newItems = targetOrder.items.map((item: any) => {
        return {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          scheduledOrderId: scheduledOrder.newId,
          inventoryItemId: item.inventoryItemId,
          inventoryUnitId: item.inventoryUnitId,
        };
      });

      await prisma.orderedItems.createMany({
        data: newItems,
      });

      returnData.push({ ...updatedScheduleOrder, items: newItems });
    }

    return res.status(200).json({
      data: returnData,
      message: 'Rearrange Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
