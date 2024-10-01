import { UPDATE_OPTION } from '@/app/admin/components/Modals/edit/EditItem';
import { Item, OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  updatedItem: Item;
  updateOption: UPDATE_OPTION;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      updatedItem,
      updateOption = UPDATE_OPTION.CURRENT_CATEGORY,
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

    // * BAD CASE: Item name existed already in that category
    if (existingItem.name !== updatedItem.name) {
      // Check is new name valid
      const itemSameName = await prisma.item.findMany({
        where: {
          name: updatedItem.name,
          categoryId: updatedItem.categoryId,
        },
      });

      if (itemSameName.length > 0) {
        return res.status(500).json({
          error: 'Item Name Already Existed',
        });
      }
    }

    // * BAD CASE: Beansprouts name and subcategoryId existed already in that category
    // If updated item is beansprouts => check is subcategory id valid
    // if (updatedItem.name.includes('BEAN')) {
    //   if (!updatedItem.subCategoryId) {
    //     return res.status(404).json({
    //       error: 'Subcategory required if item is beansprouts',
    //     });
    //   }

    //   const itemSameNameAndSubCategory = await prisma.item.findMany({
    //     where: {
    //       name: updatedItem.name,
    //       categoryId: updatedItem.categoryId,
    //       subCategoryId: updatedItem.subCategoryId,
    //     },
    //   });

    //   if (itemSameNameAndSubCategory.length !== 0) {
    //     const isNotValid = itemSameNameAndSubCategory.some(
    //       (item: Item) => item.id !== updatedItem.id,
    //     );

    //     if (isNotValid) {
    //       return res.status(500).json({
    //         error: `Item with name ${updatedItem.name} and subcategory id ${updatedItem.subCategoryId} existed already`,
    //       });
    //     }
    //   }
    // }

    // Update Item
    const newUpdatedItem = await prisma.item.update({
      where: {
        id: updatedItem.id,
      },
      data: {
        name: updatedItem.name,
        price: updatedItem.price,
        categoryId: updatedItem.categoryId,
        availability: updatedItem.availability,
      },
      include: {
        subCategory: true,
      },
    });

    // Update PRICE all items has same name
    if (updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME) {
      await prisma.item.updateMany({
        where: {
          name: existingItem.name,
        },
        data: {
          price: updatedItem.price,
          name: updatedItem.name,
        },
      });
    }

    // Update schedule order items
    const responseUpdate = await updateAllScheduleOrderItems(
      existingItem,
      updatedItem,
      updateOption,
    );

    if (!responseUpdate.ok) {
      return res.status(500).json({
        error: responseUpdate.error,
      });
    }

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
) => {
  try {
    const prisma = new PrismaClient();

    // if update all item same name
    if (updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME) {
      await prisma.orderedItems.updateMany({
        where: {
          scheduledOrderId: {
            not: null,
          },
          name: oldItem.name,
        },
        data: {
          name: updatedItem.name,
          price: updatedItem.price,
        },
      });

      return { ok: true };
    }

    // Find all users that has same categoryId
    const userList = await prisma.user.findMany({
      where: {
        categoryId: oldItem.categoryId,
      },
      include: {
        scheduleOrders: {
          include: {
            items: true,
          },
        },
      },
    });

    // Use 2 loops - O(n ^ 2) to update all items that qualified for update
    for (const user of userList) {
      for (const scheduleOrder of user.scheduleOrders) {
        if (scheduleOrder) {
          // Get the item to be updated, then subtract it from total price and add the its new price
          const itemToBeUpdated = scheduleOrder.items.find(
            (item: OrderedItems) => item.name === oldItem.name,
          );

          if (!itemToBeUpdated) {
            continue;
          }

          const oldItemPrice =
            itemToBeUpdated?.price * itemToBeUpdated?.quantity;
          const newItemPrice = updatedItem.price * itemToBeUpdated.quantity;

          const newTotalPrice =
            scheduleOrder.totalPrice - oldItemPrice + newItemPrice;

          await prisma.orderedItems.updateMany({
            where: {
              scheduledOrderId: scheduleOrder.id,
              name: oldItem.name,
            },
            data: {
              name: updatedItem.name,
              price: updatedItem.price,
            },
          });

          // Update new total price
          await prisma.scheduleOrders.update({
            where: {
              id: scheduleOrder.id,
            },
            data: {
              totalPrice: newTotalPrice,
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
