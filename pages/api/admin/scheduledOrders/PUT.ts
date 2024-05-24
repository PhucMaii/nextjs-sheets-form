import { OrderedItems, UserType } from '@/app/utils/type';
import { Item, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { UpdateOption } from '../orderedItems/PUT';

interface BodyTypes {
  user: UserType;
  items?: OrderedItems[];
  scheduledOrderId?: number;
  totalPrice?: number;
  updateOption?: UpdateOption;
  oldRouteId?: number;
  newRouteId?: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { user, items, scheduledOrderId, totalPrice, updateOption, oldRouteId, newRouteId } =
      req.body as BodyTypes;

    if (oldRouteId && newRouteId) {
      // remove from user route
      const existingUserRoute = await prisma.userRoute.findUnique({
        where: {
          userId_routeId: {
            userId: user.id,
            routeId: oldRouteId
          }
        }
      });

      if (!existingUserRoute) {
        return res.status(404).json({
          error: 'Incorrect Old Route Id'
        })
      };

      await prisma.userRoute.delete({
        where: {
          userId_routeId: {
            userId: user.id,
            routeId: oldRouteId
          }
        }
      });

      await prisma.userRoute.create({
        data: {
          userId: user.id,
          routeId: newRouteId
        }
      });

      return res.status(200).json({
        message: 'User Switch Route Successfully'
      })
    }
    
    if (!items) {
      return res.status(404).json({
        error: 'Item List Not Provided'
      })
    }
    // Update items in schedule order
    for (const item of items) {
      if (!item.id) {
        await prisma.orderedItems.create({
          data: {
            scheduledOrderId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          },
        });
        continue;
      }

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
          price: item.price,
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

    if (!updateOption || updateOption === UpdateOption.NONE) {
      return res.status(200).json({
        data: updatedScheduledOrder,
        message: 'Scheduled Order Updated Succesfully',
      });
    }

    // If update option equal to Update Category
    const userCategory = await prisma.category.findUnique({
      where: {
        id: user.categoryId,
      },
    });

    if (!userCategory) {
      return res.status(404).json({
        error: 'User Category Not Found',
      });
    }

    // base item list to track the updating process
    let baseItemList = await prisma.item.findMany({
      where: {
        categoryId: userCategory.id,
      },
    });

    for (const item of items) {
      const existingItem = await prisma.item.findFirst({
        where: {
          name: item.name,
          categoryId: userCategory.id,
        },
      });

      if (existingItem) {
        const updatedItem = await prisma.item.update({
          where: {
            id: existingItem.id,
          },
          data: {
            price: item.price,
          },
        });

        // Pop item off the category
        const newBaseItemList = baseItemList.filter((item: Item) => {
          return item.id !== updatedItem.id;
        });
        baseItemList = newBaseItemList;
      } else {
        await prisma.item.create({
          data: {
            name: item.name,
            categoryId: userCategory.id,
            price: item.price,
          },
        });
      }
    }

    // Delete the rest of item that admin wants to delete it
    if (baseItemList.length > 0) {
      for (const item of baseItemList) {
        await prisma.item.delete({
          where: {
            id: item.id,
          },
        });
      }
    }

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
