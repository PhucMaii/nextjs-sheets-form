import { UPDATE_OPTION } from '@/app/admin/[companyId]/components/Modals/edit/EditItem';
import { websiteItemCategoryId } from '@/app/lib/constant';
import { IItem, IOption } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  updatedItem: IItem | any;
  updateOption: UPDATE_OPTION;
  updatedFields: string[];
  options: IOption[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      updatedItem,
      updateOption = UPDATE_OPTION.CURRENT_CATEGORY,
      updatedFields = [],
      // options,
    }: IBody = req.body;

    if (
      !updatedItem.id ||
      !updatedItem ||
      Object.keys(updatedItem).length === 0
    ) {
      return res.status(404).json({
        error: 'Missing either item id or updated item data',
      });
    }

    const existingItem = await prisma.item.findUnique({
      where: {
        id: updatedItem.id,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        error: 'Invalid item id',
      });
    }

    // If nothing change to update
    if (
      updatedFields?.length === 0 &&
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME
    ) {
      return res.status(500).json({
        error: 'No Updated Field For Same Inventory Item',
      });
    }

    // * BAD CASE: Item name existed already in that category
    if (existingItem.name !== updatedItem.name) {
      // Check is new name valid
      const itemSameName = await prisma.item.findMany({
        where: {
          name: updatedItem.name,
          categoryId: updatedItem.categoryId,
          id: {
            not: updatedItem.id,
          },
        },
      });

      if (itemSameName.length > 0) {
        return res.status(500).json({
          error: 'Item Name Already Existed',
        });
      }
    }

    // Update Item
    const newUpdatedItem = await prisma.item.update({
      where: {
        id: updatedItem.id,
      },
      data: {
        name: updatedItem.name,
        price: updatedItem.price,
        isShowDiscount: updatedItem?.isShowDiscount,
        prevPrice: updatedItem?.prevPrice,
        availability: updatedItem.availability,
        inventoryUnitId: updatedItem.inventoryUnitId,
        image: updatedItem?.image,
        isBestSeller: updatedItem.isBestSeller,
        // system do not allow user to update inventory item id in selling item
      },
    });

    const updatedData: any = {
      name: updatedItem.name,
      price: updatedItem.price,
      inventoryUnitId: updatedItem.inventoryUnitId,
      isShowDiscount: updatedItem.isShowDiscount,
      prevPrice: updatedItem.prevPrice,
    };

    if (
      !updatedFields.includes('name') &&
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME
    ) {
      delete updatedData.name;
    }

    if (
      !updatedFields.includes('price') &&
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME
    ) {
      delete updatedData.price;
    }

    if (
      !updatedFields.includes('inventoryUnitId') &&
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME
    ) {
      delete updatedData.inventoryUnitId;
    }

    if (
      !updatedFields.includes('isShowDiscount') &&
      !updatedFields.includes('prevPrice') &&
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME
    ) {
      delete updatedData.isShowDiscount;
      delete updatedData.prevPrice;
    }

    // Update PRICE / NAME all items has same inventory id
    if (
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME &&
      existingItem.inventoryItemId
    ) {
      await prisma.item.updateMany({
        where: {
          inventoryItemId: existingItem.inventoryItemId,
          categoryId: {
            not: websiteItemCategoryId,
          },
        },
        data: updatedData,
      });
    }

    // Update schedule order items
    const responseUpdate = await updateAllScheduleOrderItems(
      existingItem,
      updatedItem,
      updateOption,
      updatedData,
    );

    if (!responseUpdate.ok) {
      return res.status(500).json({
        error: responseUpdate.error,
      });
    }

    // if (options) {
    //   if (options.length === 0) {
    //     await prisma.option.deleteMany({
    //       where: {
    //         itemId: updatedItem.id,
    //       },
    //     });
    //   } else {
    //     // Get existing options
    //     const existingOptions = await prisma.option.findMany({
    //       where: {
    //         itemId: updatedItem.id,
    //       },
    //       include: {
    //         unit: true,
    //         item: true,
    //       },
    //     });

    //     const deletedOptions = existingOptions.filter(
    //       (option) => !options.some((o) => o.id === option.id),
    //     );

    //     await prisma.option.deleteMany({
    //       where: {
    //         id: {
    //           in: deletedOptions.map((option) => option.id),
    //         },
    //       },
    //     });

    //     if (updateOption !== UPDATE_OPTION.ALL_ITEMS_SAME_NAME) {
    //       const today = getTodayDate();
    //       const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    //       const updatedOptions = options.map(async (option) => {
    //         const existingOption = existingOptions.find(
    //           (o) => o.id === option.id,
    //         );
    //         if (existingOption) {
    //           return prisma.option.update({
    //             where: {
    //               id: existingOption.id,
    //             },
    //             data: {
    //               name: option.name,
    //               price: option.price,
    //               unitId: option.unitId,
    //               prevPrice: option.prevPrice,
    //               isShowDiscount: option.isShowDiscount,
    //             },
    //           });
    //         } else {
    //           return prisma.option.create({
    //             data: {
    //               name: option.name,
    //               price: option.price,
    //               prevPrice: option.prevPrice,
    //               isShowDiscount: option.isShowDiscount,
    //               availability: option.availability,
    //               unitId: option.unitId,
    //               inventoryItemId: updatedItem.inventoryItemId,
    //               itemId: updatedItem.id,
    //               createdBy,
    //               createdAt: today.dateAndTime,
    //             },
    //           });
    //         }
    //       });

    //       await Promise.all(updatedOptions);

    //       const justUpdatedOptions = await prisma.option.findMany({
    //         where: {
    //           itemId: updatedItem.id,
    //         },
    //       });

    //       const updatedScheduleOrderItemPromises = justUpdatedOptions.map(
    //         (option) => {
    //           const oldOption = existingOptions.find((o) => o.id === option.id);
    //           if (oldOption) {
    //             return updateAllScheduleOrderItemsForOption(
    //               oldOption,
    //               option,
    //               updatedItem.categoryId,
    //               true,
    //             );
    //           }
    //         },
    //       );

    //       await Promise.all(updatedScheduleOrderItemPromises);
    //     }
    //   }
    // }

    return res.status(200).json({
      data: newUpdatedItem,
      message: 'Item Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

const updateAllScheduleOrderItems = async (
  oldItem: any,
  updatedItem: any,
  updateOption: UPDATE_OPTION,
  updatedData: any,
) => {
  try {
    const prisma = new PrismaClient();

    // CASE 1: UPDATE ALL ITEM WITH SAME INVENTORY ITEM ID - if update all ordered item in scheduled orders same inventory id
    if (
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME &&
      updatedItem?.inventoryItemId
    ) {
      await prisma.orderedItems.updateMany({
        where: {
          scheduledOrderId: {
            not: null,
          },
          orderId: null,
          expenseId: null,
          inventoryItemId: updatedItem.inventoryItemId,
        },
        data: updatedData,
      });

      // Update all scheduled orders that has items with same inventory item id
      const scheduleOrders = await prisma.scheduleOrders.findMany({
        where: {
          items: {
            some: {
              inventoryItemId: updatedItem.inventoryItemId,
            },
          },
        },
        include: {
          items: true,
        },
      });

      // Re calculate their new total price if the udpated data included price
      if (updatedData?.price) {
        for (const scheduleOrder of scheduleOrders) {
          const totalPrice = scheduleOrder.items.reduce(
            (acc: number, item: any) => {
              return acc + item.quantity * item.price;
            },
            0,
          );

          await prisma.scheduleOrders.update({
            where: {
              id: scheduleOrder.id,
            },
            data: {
              totalPrice: totalPrice,
            },
          });
        }
      }

      return { ok: true };
    }

    // CASE 2: UPDATE ONLY SELECTED ITEM -  Find all users that has same categoryId
    const scheduleOrders = await prisma.scheduleOrders.findMany({
      where: {
        user: {
          categoryId: oldItem.categoryId,
        },
      },
      include: {
        items: true,
      },
    });

    // Flat items in schedule orders
    const scheduleOrderItems = scheduleOrders.flatMap(
      (scheduleOrder: any) => scheduleOrder.items,
    );

    // Filter items that match with old item
    const matchedItems = scheduleOrderItems.filter(
      (item: any) => item.inventoryItemId === oldItem.inventoryItemId,
    );

    // Update matched items
    await prisma.orderedItems.updateMany({
      where: {
        scheduledOrderId: {
          not: null,
        },
        id: {
          in: matchedItems.map((item: any) => item.id),
        },
      },
      data: updatedData,
    });

    const justUpdatedOrders = await prisma.scheduleOrders.findMany({
      where: {
        user: {
          categoryId: oldItem.categoryId,
        },
      },
      include: {
        items: true,
      },
    });

    // Update all orders total price
    if (updatedData?.price) {
      for (const scheduleOrder of justUpdatedOrders) {
        // Fetch items again to get new data after update
        // const orderedItems = await prisma.orderedItems.findMany({
        //   where: {
        //     scheduledOrderId: scheduleOrder.id,
        //   },
        // });
        const orderedItems = scheduleOrder.items;

        if (orderedItems.length > 0) {
          const totalPrice = orderedItems.reduce(
            (total: number, item: any) => total + item.quantity * item.price,
            0,
          );

          await prisma.scheduleOrders.update({
            where: {
              id: scheduleOrder.id,
            },
            data: {
              totalPrice,
            },
          });
        }
      }
    }

    return { ok: true };
  } catch (error: any) {
    console.log(
      'Internal Server Error from update schedule order items: ',
      error,
    );
    return { ok: false, error };
  }
};
