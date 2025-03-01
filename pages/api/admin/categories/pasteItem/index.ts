import { Item, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  categoryId: number;
  newItems: Item[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { categoryId, newItems }: IBody = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
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

    if (!existingCategory) {
      return res.status(404).json({
        error: 'Category Id Not Found',
      });
    }

    // Delete old items from category
    await prisma.item.deleteMany({
      where: {
        categoryId: categoryId,
      },
    });

    const formattedNewItems = newItems.map((item: Item) => {
      return {
        name: item.name,
        price: item.price,
        categoryId: categoryId,
        availability: item?.availability,
        isShowDiscount: item?.isShowDiscount,
        prevPrice: item?.prevPrice,
        inventoryItemId: item?.inventoryItemId,
        inventoryUnitId: item?.inventoryUnitId,
      };
    });

    // Create new items
    await prisma.item.createMany({
      data: formattedNewItems,
    });

    // Set up new schedule order items
    // Get all existing schedule orders
    const oldScheduledOrders = existingCategory.users.flatMap((user) => {
      return user.scheduleOrders;
    });

    const newOrderedItems: any = [];
    // Loop through each order
    for (const oldScheduledOrder of oldScheduledOrders) {
      // Map through each of old items and apply new items information if it exists, otherwise flag item as deleted
      const newScheduledOrderItems = oldScheduledOrder.items
        .map((oldItem) => {
          const newItem = formattedNewItems.find(
            (item) => item.inventoryItemId === oldItem.inventoryItemId,
          );

          if (newItem) {
            return {
              name: newItem.name,
              price: newItem.price,
              quantity: oldItem.quantity,
              inventoryItemId: newItem?.inventoryItemId || null,
              inventoryUnitId: newItem?.inventoryUnitId || null,
              isShowDiscount: newItem?.isShowDiscount,
              prevPrice: newItem?.prevPrice,
              scheduledOrderId: oldScheduledOrder.id,
            };
          } else {
            return {
              ...oldItem,
              isDeleted: true,
            };
          }
        })
        .filter((item: any) => !item.isDeleted);

      // Add new items into new ordered items
      newOrderedItems.push(...newScheduledOrderItems);

      // Update total price of schedule order before delete old items and create new items
      const newTotalPrice = newScheduledOrderItems.reduce(
        (acc: number, newItem: any) => {
          const itemTotalPrice = newItem.price * newItem.quantity;
          return acc + itemTotalPrice;
        },
        0,
      );

      await prisma.scheduleOrders.update({
        where: {
          id: oldScheduledOrder.id,
        },
        data: {
          totalPrice: newTotalPrice,
        },
      });
    }

    // Delete all old schedule order items
    await prisma.orderedItems.deleteMany({
      where: {
        scheduledOrderId: {
          in: oldScheduledOrders.map((order) => order.id),
        },
      },
    });

    // Create new schedule order items
    await prisma.orderedItems.createMany({
      data: newOrderedItems,
    });

    // const newScheduledOrderItems = [];
    // for (const oldScheduledOrder of oldScheduledOrders) {
    //   const newCategoryItems = formattedNewItems.map((item) => {
    //     const existingItem = oldScheduledOrder.items.find(
    //       (oldItem) => oldItem.name === item.name,
    //     );

    //     return {
    //       name: item.name,
    //       price: item.price,
    //       quantity: existingItem?.quantity || 0,
    //       inventoryItemId: item?.inventoryItemId || null,
    //       inventoryUnitId: item?.inventoryUnitId || null,
    //       isShowDiscount:
    //         existingItem?.isShowDiscount || item?.isShowDiscount || false,
    //       prevPrice: existingItem?.prevPrice || item?.prevPrice || null,
    //       scheduledOrderId: oldScheduledOrder.id,
    //     };
    //   });
    //   newScheduledOrderItems.push(...newCategoryItems);

    //   const newTotalPrice = newCategoryItems.reduce(
    //     (acc: number, newItem: any) => {
    //       const itemTotalPrice = newItem.price * newItem.quantity;
    //       return acc + itemTotalPrice;
    //     },
    //     0,
    //   );

    //   if (newTotalPrice !== oldScheduledOrder.totalPrice) {
    //     await prisma.scheduleOrders.update({
    //       where: {
    //         id: oldScheduledOrder.id,
    //       },
    //       data: {
    //         totalPrice: newTotalPrice,
    //       },
    //     });
    //   }
    // }

    // // Delete old items from schedule orders
    // const scheduleOrderIds = existingCategory.users.flatMap((user) => {
    //   return user.scheduleOrders.map((scheduleOrder) => {
    //     return scheduleOrder.id;
    //   });
    // });

    // await prisma.orderedItems.deleteMany({
    //   where: {
    //     scheduledOrderId: {
    //       in: scheduleOrderIds,
    //     },
    //   },
    // });

    // // Create new schedule order items
    // await prisma.orderedItems.createMany({
    //   data: newScheduledOrderItems,
    // });

    return res.status(200).json({
      message: 'Items Pasted Succesfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
