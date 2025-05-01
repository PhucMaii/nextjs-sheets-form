import { IItem } from '@/app/utils/type';
import prisma from '@/client';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  categoryIds: number[];
  updatedItem: IItem;
  updatedFields: string[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { categoryIds, updatedItem, updatedFields } = req.body as IBody;

    const fieldsToUpdate: any = {};
    if (updatedFields.includes('name')) {
      fieldsToUpdate.name = updatedItem.name;
    }

    if (updatedFields.includes('price')) {
      fieldsToUpdate.price = updatedItem.price;
    }

    if (updatedFields.includes('isShowDiscount')) {
      fieldsToUpdate.isShowDiscount = updatedItem.isShowDiscount;
      fieldsToUpdate.prevPrice = updatedItem.prevPrice;
    }

    if (updatedFields.includes('inventoryUnitId')) {
      fieldsToUpdate.inventoryUnitId = updatedItem.inventoryUnitId;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    // - Get list of selling items based on categoryIds
    const sellingItems = await prisma.item.findMany({
      where: {
        categoryId: { in: categoryIds },
        inventoryItemId: updatedItem.inventoryItemId,
      },
    });

    if (sellingItems.length === 0) {
      return res.status(400).json({ error: 'No selling items found' });
    }

    // - Update that list of selling items with updatedItem.
    await prisma.item.updateMany({
      where: { id: { in: sellingItems.map((item) => item.id) } },
      data: fieldsToUpdate,
    });

    // - Get list of scheduledOrders based on categoryIds
    const scheduledOrders = await prisma.scheduleOrders.findMany({
      where: {
        user: {
          categoryId: { in: categoryIds },
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
      },
    });

    // - Get list of orderedItems from scheduledOrders if inventoryItemId are the same.
    const scheduledOrderRelatedIds: number[] = [];
    const orderedItems = scheduledOrders.flatMap((order) => {
      const items = order.items.filter(
        (item) => item.inventoryItemId === updatedItem.inventoryItemId,
      );

      if (items.length > 0) {
        scheduledOrderRelatedIds.push(order.id);
      }

      return items;
    });

    console.log(orderedItems, 'ORDERED ITEMS');
    // - Update that list of orderedItems
    if (orderedItems.length > 0) {
      await prisma.orderedItems.updateMany({
        where: { id: { in: orderedItems.map((item) => item.id) } },
        data: fieldsToUpdate,
      });

      const scheduledOrdersRelatedWithUpdatedItem =
        await prisma.scheduleOrders.findMany({
          where: {
            id: { in: scheduledOrderRelatedIds },
          },
          include: {
            items: {
              include: {
                inventoryItem: true,
                inventoryUnit: true,
              },
            },
          },
        });

      // - Update scheduledOrder total price
      for (const order of scheduledOrdersRelatedWithUpdatedItem) {
        const totalPrice = order.items.reduce(
          (acc: number, item: any) => acc + item.quantity * item.price,
          0,
        );

        await prisma.scheduleOrders.update({
          where: { id: order.id },
          data: {
            totalPrice,
          },
        });
      }
    }

    return res.status(200).json({ message: 'Items updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return res.status(500).json({ error: error.message });
  }
};

export default withAdminAuthGuard(handler);
