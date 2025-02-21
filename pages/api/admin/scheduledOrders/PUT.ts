import { UserType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  categorizeUpdatedItems,
  ITEM_CATEGORIZED,
} from '../orderedItems/PUT';
import { getRouteScheduledOrders, refactorRouteArrangement } from './POST';

interface BodyTypes {
  user: UserType;
  items?: any[];
  scheduledOrderId: number;
  oldRouteId?: number;
  newRouteId?: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { user, items, scheduledOrderId, oldRouteId, newRouteId } =
      req.body as BodyTypes;

    console.log(req.body, "REQ BODY");

    // CASE: Move to new route
    if (oldRouteId && newRouteId) {
      // remove from user route
      const existingUserRoute = await prisma.userRoute.findUnique({
        where: {
          userId_routeId: {
            userId: user.id,
            routeId: oldRouteId,
          },
        },
      });

      if (!existingUserRoute) {
        return res.status(404).json({
          error: 'Incorrect Old Route Id',
        });
      }

      // Delete old route connection
      await prisma.userRoute.delete({
        where: {
          userId_routeId: {
            userId: user.id,
            routeId: oldRouteId,
          },
        },
      });

      // Create new position index for order in new route
      const routeScheduledOrders = await getRouteScheduledOrders(newRouteId);
      await prisma.positionIndex.update({
        where: {
          scheduledOrderId,
        },
        data: {
          index: routeScheduledOrders.length,
        },
      });

      // Create new route connection
      await prisma.userRoute.create({
        data: {
          userId: user.id,
          routeId: newRouteId,
        },
      });

      await refactorRouteArrangement(oldRouteId);

      return res.status(200).json({
        message: 'User Switch Route Successfully',
      });
    }

    // CASE: Update items
    if (!items) {
      return res.status(404).json({
        error: 'Item List Not Provided',
      });
    }

    const existingScheduleOrder = await prisma.scheduleOrders.findUnique({
      where: {
        id: scheduledOrderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingScheduleOrder) {
      return res.status(404).json({
        error: `Schedule Order ${scheduledOrderId} Not Found`,
      });
    }

    // Attach type of items: CREATE, UPDATE, DELETE
    const categorizedItems = categorizeUpdatedItems(
      existingScheduleOrder.items,
      items,
    );

    const deletedItemIds = [];
    // Update items in schedule order
    for (const item of categorizedItems) {
      // CREATE
      if (item.type == ITEM_CATEGORIZED.CREATE) {
        await prisma.orderedItems.create({
          data: {
            scheduledOrderId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            isShowDiscount: item?.isShowDiscount,
            prevPrice: item?.prevPrice,
            inventoryItemId: item.inventoryItemId,
            inventoryUnitId: item.inventoryUnitId,
          },
        });
        continue;
      } else if (item.type === ITEM_CATEGORIZED.REMAIN) {
        // REMAIN
        continue;
      } else if (item.type === ITEM_CATEGORIZED.UPDATE) {
        // UPDATE
        await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            quantity: item.quantity,
            price: item.price, // Price might be useless, since it is not able to update price at front end
          },
        });
      } else if (item.type === ITEM_CATEGORIZED.DELETE) {
        // DELETE
        deletedItemIds.push(item.id);
      } else {
        return res.status(500).json({
          error: 'Something went wrong with categorized items',
        })
      }
    }

    if (deletedItemIds.length > 0) {
      await prisma.orderedItems.deleteMany({
        where: {
          id: {
            in: deletedItemIds,
          },
        },
      });
    }

    const newItems = await prisma.orderedItems.findMany({
      where: {
        scheduledOrderId,
      },
    });

    // Calculate total price
    const totalPrice = newItems.reduce((acc: number, item: any) => {
      return acc + item.price * item.quantity;
    }, 0);

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
