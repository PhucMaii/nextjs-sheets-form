import { Item, OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface UpdatedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  orderId: number;
}

export enum UpdateOption {
  NONE = 'none',
  CREATE = 'create',
  UPDATE = 'update',
}

interface BodyType {
  orderId: number;
  updatedItems: UpdatedItem[];
  orderTotalPrice: number;
  updateOption?: UpdateOption;
  categoryName?: string;
  userId?: number;
  userCategoryId?: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      orderTotalPrice,
      updateOption,
      categoryName,
      userId,
      userCategoryId,
    } = updatedData as BodyType;

    // Track order items
    let orderedItemList = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
    });

    for (const item of updatedItems) {
      // Check does system has that item
      if (item.id) {
        const existingItem = await prisma.orderedItems.findUnique({
          where: {
            id: item.id,
          },
        });

        if (!existingItem) {
          return res.status(404).json({
            error: 'Item Not Found',
          });
        }

        const updatedItem = await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: item.price,
            quantity: item.quantity,
          },
        });

        // Pop the item off the base list in order to track the item
        const newList = orderedItemList.filter((item: OrderedItems) => {
          return item.id !== updatedItem.id;
        });
        orderedItemList = newList;
      } else {
        // Check does item name exist already in that order
        const foundItem = await prisma.orderedItems.findFirst({
          where: {
            name: item.name,
            orderId,
          },
        });

        if (foundItem) {
          return res.status(500).json({
            error: 'Item Name Exist Already',
          });
        }

        // if not, create it in the same order id
        await prisma.orderedItems.create({
          data: {
            name: item.name,
            orderId: orderId,
            price: item.price,
            quantity: item.quantity,
          },
        });
      }
    }

    // Delete the rest of item that admin wants to delete it
    if (orderedItemList.length > 0) {
      for (const item of orderedItemList) {
        await prisma.orderedItems.delete({
          where: {
            id: item.id,
          },
        });
      }
    }

    await updateOrderTotalPrice(orderId, orderTotalPrice);

    // First case: No update neither create new category
    if (updateOption === UpdateOption.NONE || !updateOption) {
      return res.status(200).json({
        message: 'Update Data Successfully',
      });
    }

    // Second case: if user want to create new category
    if (updateOption === UpdateOption.CREATE) {
      const existingCategory = await prisma.category.findUnique({
        where: {
          name: categoryName,
        },
      });

      if (existingCategory) {
        return res.status(500).json({
          error: 'Category Name Existed Already',
        });
      }

      const newCategory = await prisma.category.create({
        data: {
          name: categoryName ? categoryName : '',
        },
      });

      const formattedUpdatedItems = formatUpdatedItems(
        newCategory.id,
        updatedItems,
      );

      // create new items
      const newItems = await prisma.item.createMany({
        data: [...formattedUpdatedItems],
      });

      // assign client to new categoryId
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          categoryId: newCategory.id,
        },
      });

      return res.status(200).json({
        data: newItems,
        message: 'New Category Created Successfully',
      });
    }

    // last case: if user want to update category price
    if (updateOption === UpdateOption.UPDATE) {
      if (!userCategoryId) {
        return res.status(404).json({
          error: 'Request is missing user category id',
        });
      }

      let baseItemList = await prisma.item.findMany({
        where: {
          categoryId: userCategoryId,
        },
      });

      for (const item of updatedItems) {
        const existingItem = await prisma.item.findFirst({
          where: {
            name: item.name,
            categoryId: userCategoryId,
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
              categoryId: userCategoryId,
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
        message: 'Category Price Updated Succesfully',
      });
    }
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const updateOrderTotalPrice = async (
  orderId: number,
  newTotalPrice: number,
) => {
  try {
    const prisma = new PrismaClient();

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: newTotalPrice,
      },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

const formatUpdatedItems = (categoryId: number = 0, updatedItems: any) => {
  const formattedUpdatedItems = updatedItems.map(
    (
      item: UpdatedItem,
    ): { name: string; price: number; categoryId: number } => {
      return {
        name: item.name,
        price: item.price,
        categoryId: categoryId,
      };
    },
  );

  return formattedUpdatedItems;
};
