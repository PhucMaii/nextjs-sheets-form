import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { items }: any = req.body;

    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    if (!items) {
      return res.status(404).json({ error: 'Items is required' });
    }

    const itemIds = items.map((item: any) => item.id);

    // Get db items
    const dbItems = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
      include: {
        category: true,
      },
    });

    if (dbItems.length === 0) {
      return res.status(404).json({ error: 'Items not found' });
    }

    const itemPromises = items.map((item: any) => {
      const dbItem = dbItems.find((dbItem: any) => dbItem.id === item.id);

      if (!dbItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (
        dbItem.name !== item.name ||
        dbItem.price !== item.price ||
        dbItem.prevPrice !== item.prevPrice ||
        dbItem.isShowDiscount !== item.isShowDiscount ||
        dbItem.inventoryUnitId !== item.inventoryUnitId
      ) {
        return prisma.item.update({
          where: {
            id: item.id,
          },
          data: {
            name: item.name,
            price: item.price,
            prevPrice: item.prevPrice,
            isShowDiscount: item.isShowDiscount,
            inventoryUnitId: item.inventoryUnitId,
          },
        });
      }
    });

    const updatedItems = await Promise.all(itemPromises);

    await handleUpdatAllScheduleOrders(items);

    return res
      .status(200)
      .json({ data: updatedItems, message: 'Update Items Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);

const handleUpdatAllScheduleOrders = async (items: any) => {
  try {
    const categoriesRelated = await prisma.category.findMany({
      where: {
        id: {
          in: items.map((item: any) => item.categoryId),
        },
      },
      include: {
        users: {
          include: {
            scheduleOrders: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    const newItems: any[] = [];
    // Get all items related
    const promisesItem = items.map((item: any) => {
      const currentCategory = categoriesRelated.find(
        (category: any) => category.id === item.categoryId,
      );

      if (!currentCategory) {
        return null;
      }

      const relatedItems = currentCategory?.users?.flatMap((user: any) => {
        return user.scheduleOrders.flatMap((scheduleOrder: any) => {
          return scheduleOrder.items.filter((scheduleOrderItem: any) => {
            return scheduleOrderItem.inventoryItemId === item.inventoryItemId;
          });
        });
      });

      if (relatedItems.length === 0) {
        return null;
      }

      newItems.push(
        ...relatedItems.map((relatedItem: any) => {
          return {
            ...relatedItem,
            name: item.name,
            price: item.price,
            prevPrice: item.prevPrice,
            isShowDiscount: item.isShowDiscount,
            inventoryUnitId: item.inventoryUnitId,
          };
        }),
      );

      return prisma.orderedItems.updateMany({
        where: {
          id: {
            in: relatedItems.map((item: any) => item.id),
          },
        },
        data: {
          name: item.name,
          price: item.price,
          prevPrice: item.prevPrice,
          isShowDiscount: item.isShowDiscount,
          inventoryUnitId: item.inventoryUnitId,
        },
      });
    });

    await Promise.all(promisesItem);

    console.log('new items ', newItems);

    // Update schedule orders total price
    const promisesScheduleOrders = newItems.map((newItem: any) => {
      const matchingScheduleOrder = categoriesRelated.flatMap((category: any) =>
        category.users.flatMap((user: any) =>
          user.scheduleOrders.filter(
            (scheduleOrder: any) =>
              scheduleOrder.id === newItem.scheduledOrderId,
          ),
        ),
      )[0];

      console.log('matchingScheduleOrder: ', {matchingScheduleOrder, newItem});

      if (!matchingScheduleOrder) {
        return null;
      }

      const totalPrice = matchingScheduleOrder.items.reduce(
        (acc: number, item: any) => {
          if (item.inventoryItemId === newItem.inventoryItemId) {
            return acc + newItem.price * item.quantity;
          }

          return acc + item.price * item.quantity;
        },
        0,
      );

      return prisma.scheduleOrders.update({
        where: {
          id: newItem.scheduledOrderId,
        },
        data: {
          totalPrice,
        },
      });
    });

    await Promise.all(promisesScheduleOrders);
  } catch (error: any) {
    return { ok: true, error };
  }
};
