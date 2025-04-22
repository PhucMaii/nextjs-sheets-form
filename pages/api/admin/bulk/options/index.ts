import { ICategory } from '@/app/utils/type';
import { getUserInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { inventoryItemId, categories, updatedOptions } = req.body;

    if (!categories) {
      return res.status(400).json({ error: 'Categories are required' });
    }

    const categoryIds = categories.map((category: any) => category.id);

    const items = await prisma.item.findMany({
      where: {
        inventoryItemId,
        categoryId: {
          in: categoryIds,
        },
      },
      include: {
        options: true,
      },
    });

    // // Cached all old options
    // const optionRelated = await prisma.option.findMany({
    //     where: {
    //         itemId: {
    //             in: items.map((item: any) => item.id),
    //         },
    //     },
    // });

    // Delete old options
    await prisma.option.deleteMany({
      where: {
        itemId: {
          in: items.map((item: any) => item.id),
        },
      },
    });

    // Create new options
    // Each loop -> create new updated options for each item
    const today = getTodayDate();
    const admin: any = await getUserInfo(req, res);
    const promiseOptions = items.map((item: any) => {
      return prisma.option.createMany({
        data: updatedOptions.map((option: any) => {
          return {
            name: option.name,
            price: option.price,
            availability: option.availability,
            unitId: Number(option.unitId),
            createdAt: today.dateAndTime,
            createdBy: `Admin - ${admin.clientName}`,
            prevPrice: option?.prevPrice,
            isShowDiscount: option?.isShowDiscount,
            inventoryItemId: item.inventoryItemId,
            itemId: item.id,
          };
        }),
      });
    });

    await Promise.all(promiseOptions);

    // Handle update scheduled orders
    const responseStatus = await handleUpdateAllScheduleOrders(
      inventoryItemId,
      categories,
      updatedOptions,
    );

    if (responseStatus.ok === false) {
      console.log(responseStatus.error);
      return res.status(400).json({ error: responseStatus.error });
    }

    const updatedItems = await prisma.item.findMany({
      where: {
        inventoryItemId,
        categoryId: {
          in: categoryIds,
        },
      },
      include: {
        options: {
          include: {
            unit: true,
            item: true,
          },
        },
        inventoryUnit: true,
        inventoryItem: {
          include: {
            vendorItem: {
              include: {
                unit: true,
              },
            },
            type: true,
          },
        },
        category: {
          include: {
            itemType_category: {
              include: {
                itemType: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Update Options Successfully',
      data: updatedItems,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);

const handleUpdateAllScheduleOrders = async (
  inventoryItemId: number,
  categories: ICategory[],
  updatedOptions: any,
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        categoryId: {
          in: categories.map((category: any) => category.id),
        },
      },
      include: {
        scheduleOrders: {
          include: {
            items: true,
          },
        },
      },
    });

    const targetOrderedItems = users.flatMap((user: any) => {
      return user.scheduleOrders.flatMap((scheduleOrder: any) => {
        return scheduleOrder.items.filter((item: any) => {
          return item.inventoryItemId === inventoryItemId;
        });
      });
    });

    // If there is no pre ordered items -> return
    if (targetOrderedItems.length === 0) {
      return {ok: true}
    }

    const promisesItem = targetOrderedItems.map((item: any) => {
      // 1st Case: Item Does not have option -> Assign to ratio of 1 or first option
      if (!item.option.name || !item.option.price || !item.option.ratio) {
        const ratioOf1 = updatedOptions.find(
          (option: any) => option.ratio === 1,
        );
        return prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
            prevPrice: ratioOf1
              ? ratioOf1.prevPrice
              : updatedOptions[0]?.prevPrice, 
            isShowDiscount: ratioOf1
              ? ratioOf1.isShowDiscount
              : updatedOptions[0]?.isShowDiscount,
            option: {
              name: ratioOf1 ? ratioOf1.name : updatedOptions[0]?.name,
              price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
              ratio: ratioOf1
                ? ratioOf1.unit.ratio
                : updatedOptions[0]?.unit?.ratio,
              prevPrice: ratioOf1
                ? ratioOf1.prevPrice
                : updatedOptions[0]?.prevPrice,
              isShowDiscount: ratioOf1
                ? ratioOf1.isShowDiscount
                : updatedOptions[0]?.isShowDiscount,
            },
          },
        });
      } else {
        // 2nd Case: Item has option
        const isOptionExisted = updatedOptions.find(
          (option: any) => option.name === item.option.name,
        );

        // If option is existed -> update
        if (isOptionExisted) {
          return prisma.orderedItems.update({
            where: {
              id: item.id,
            },
            data: {
              price: isOptionExisted.price,
              prevPrice: isOptionExisted?.prevPrice,
              isShowDiscount: isOptionExisted?.isShowDiscount,
              option: {
                name: isOptionExisted.name,
                price: isOptionExisted.price,
                ratio: isOptionExisted?.unit?.ratio,
                prevPrice: isOptionExisted?.prevPrice,
                isShowDiscount: isOptionExisted?.isShowDiscount,
              },
            },
          });
        } else {
          // If option is not existed -> assign to ratio of 1 or first option
          const ratioOf1 = updatedOptions.find(
            (option: any) => option.ratio === 1,
          );

          return prisma.orderedItems.update({
            where: {
              id: item.id,
            },
            data: {
              price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
              prevPrice: ratioOf1
                ? ratioOf1.prevPrice
                : updatedOptions[0]?.prevPrice,
              isShowDiscount: ratioOf1
                ? ratioOf1.isShowDiscount
                : updatedOptions[0]?.isShowDiscount,
              option: {
                name: ratioOf1 ? ratioOf1.name : updatedOptions[0]?.name,
                price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
                ratio: ratioOf1
                  ? ratioOf1.unit.ratio
                  : updatedOptions[0]?.unit?.ratio,
                prevPrice: ratioOf1
                  ? ratioOf1.prevPrice
                  : updatedOptions[0]?.prevPrice,
                isShowDiscount: ratioOf1
                  ? ratioOf1.isShowDiscount
                  : updatedOptions[0]?.isShowDiscount,
              },
            },
          });
        }
      }
    });

    await Promise.all(promisesItem);

    // Handle total price
    const scheduledOrders = await prisma.scheduleOrders.findMany({
      where: {
        userId: {
          in: users.map((user: any) => user.id),
        }
      },
      include: {
        items: true,
      }
    });

    const promisesOrder = scheduledOrders.map((order: any) => {
      const newTotalPrice = order.items.reduce((total: number, item: any) => {
        return total + item.price * item.quantity;
      }, 0);

      return prisma.scheduleOrders.update({
        where: {
          id: order.id,
        },
        data: {
          totalPrice: newTotalPrice,
        },
      });
    });

    await Promise.all(promisesOrder);
    return { ok: true, message: 'Update Options Successfully' };
  } catch (error: any) {
    return { ok: false, error };
  }
};
