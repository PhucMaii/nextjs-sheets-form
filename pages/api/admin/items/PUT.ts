import { UPDATE_OPTION } from '@/app/admin/components/Modals/edit/EditItem';
import { Item, OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  updatedItem: Item;
  updateOption: UPDATE_OPTION;
  updatedFields: string[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      updatedItem,
      updateOption = UPDATE_OPTION.CURRENT_CATEGORY,
      updatedFields = [],
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
        categoryId: updatedItem.categoryId,
        availability: updatedItem.availability,
        inventoryUnitId: updatedItem.inventoryUnitId,
      },
    });

    const updatedData: any = {
      name: updatedItem.name,
      price: updatedItem.price,
      inventoryUnitId: updatedItem.inventoryUnitId,
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

    // Update PRICE / NAME all items has same inventory id
    if (
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME &&
      existingItem.inventoryItemId
    ) {
      await prisma.item.updateMany({
        where: {
          inventoryItemId: existingItem.inventoryItemId,
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

      return { ok: true };
    }

    // CASE 2: UPDATE ONLY SELECTED ITEM -  Find all users that has same categoryId
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

    // Use 2 loops - O(n ^ 2) to update all items that qualified for update in schedule orders
    for (const user of userList) {
      // Access to each user
      for (const scheduleOrder of user.scheduleOrders) {
        // Access to each schedule order
        if (scheduleOrder) {
          // Get the item to be updated, then subtract it from total price and add the its new price
          const itemToBeUpdated = scheduleOrder.items.find(
            (item: OrderedItems) =>
              item?.inventoryItemId === oldItem.inventoryItemId,
          );

          if (!itemToBeUpdated) {
            continue;
          }

          const oldItemPrice =
            itemToBeUpdated?.price * itemToBeUpdated?.quantity;
          const newItemPrice = updatedItem.price * itemToBeUpdated.quantity;

          const newTotalPrice =
            scheduleOrder.totalPrice - oldItemPrice + newItemPrice;

          await prisma.orderedItems.update({
            where: {
              id: itemToBeUpdated.id,
            },
            data: updatedData,
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
