import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  removedId?: number;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { removedId }: IBody = req.body;

    if (removedId) {
      const deletedItem = await prisma.item.delete({
        where: {
          id: removedId,
        },
      });

      // Remove item from all scheduled orders related to selected category
      const scheduledOrders = await prisma.scheduleOrders.findMany({
        where: {
          user: {
            categoryId: deletedItem.categoryId,
          },
        },
        include: {
          items: true,
        },
      });

      const scheduleOrderIds: number[] = [];
      for (const scheduledOrder of scheduledOrders) {
        const targetdOrderedItems = scheduledOrder.items.find((item: any) => {
          return item.inventoryItemId === deletedItem.inventoryItemId;
        });

        if (!targetdOrderedItems) {
          continue;
        }

        const newTotalPrice =
          scheduledOrder.totalPrice -
          (deletedItem.price * targetdOrderedItems.quantity);

        await prisma.scheduleOrders.update({
          where: {
            id: scheduledOrder.id,
          },
          data: {
            totalPrice: newTotalPrice,
          },
        });

        scheduleOrderIds.push(scheduledOrder.id);
      }

      await prisma.orderedItems.deleteMany({
        where: {
          scheduledOrderId: {
            in: scheduleOrderIds,
          },
          inventoryItemId: deletedItem.inventoryItemId,
        },
      });

      return res.status(200).json({
        message: `${deletedItem.name} Deleted Successfully`,
      });
    }

    return res.status(404).json({
      error: 'Neither removed id nor removed id list provided',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
