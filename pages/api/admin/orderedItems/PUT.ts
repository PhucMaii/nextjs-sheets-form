/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Item,
  OrderedItems,
  PrismaClient,
  ScheduleOrders,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface UpdatedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  orderId: number;
  totalPrice: number;
  subCategoryId?: number;
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
  userCategoryId: number;
  userSubCategoryId: number;
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
      userSubCategoryId,
    } = updatedData as BodyType;

    // Bad cases
    if (updateOption === UpdateOption.CREATE) {
      const existingCategory = await prisma.category.findUnique({
        where: {
          name: categoryName,
        },
      });
      if (existingCategory) {
        return res.status(401).json({
          error: 'Category Name Existed Already',
        });
      }
    }

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
            error: `Item ${item.name} with price of ${item.price} Not Found`,
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
          return item.name !== updatedItem.name;
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

        // if yes, override the price and quantity
        if (foundItem) {
          await prisma.orderedItems.updateMany({
            where: {
              name: item.name,
              orderId,
            },
            data: {
              price: item.price,
              quantity: item.quantity,
            },
          });

          // Pop the item off the base list in order to track the item
          const newList = orderedItemList.filter((item: OrderedItems) => {
            return item.id !== foundItem.id;
          });
          orderedItemList = newList;
        } else {
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
      const newCategory = await prisma.category.create({
        data: {
          name: categoryName ? categoryName : '',
        },
      });

      const formattedUpdatedItems = await formatUpdatedItems(
        newCategory.id,
        updatedItems,
        userSubCategoryId,
      );

      // create new items
      const newItems = await prisma.item.createMany({
        data: formattedUpdatedItems,
      });

      // assign client to new categoryId
      const targetClient = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          categoryId: newCategory.id,
        },
        include: {
          scheduleOrders: {
            include: {
              items: true,
            },
          },
        },
      });

      if (
        !targetClient.scheduleOrders ||
        targetClient.scheduleOrders.length === 0
      ) {
        return res.status(200).json({
          data: newItems,
          message: 'New Category Created Successfully',
        });
      }

      // Update schedule order of this client
      for (const scheduleOrder of targetClient.scheduleOrders) {
        await updateScheduleOrderItems(updatedItems, scheduleOrder);
      }
    }

    // last case: if user want to update category price
    if (updateOption === UpdateOption.UPDATE) {
      if (!userCategoryId) {
        return res.status(404).json({
          error: 'Request is missing user category id',
        });
      }

      let fetchCondition: any = { categoryId: userCategoryId };

      if (userSubCategoryId) {
        fetchCondition.subCategoryId = userSubCategoryId;
      }

      // Get beansprouts based on subcateogry id if it is provided
      const beansprouts = await prisma.item.findMany({
        where: fetchCondition,
      });

      // Get the rest of items
      const itemList = await prisma.item.findMany({
        where: {
          categoryId: userCategoryId,
          subCategoryId: null,
        },
      });

      let baseItemList = [...itemList, ...beansprouts];

      for (const item of updatedItems) {
        if (!item.subCategoryId) {
          fetchCondition = { categoryId: userCategoryId };
        } else {
          fetchCondition = {
            categoryId: userCategoryId,
            subCategoryId: userSubCategoryId,
          };
        }
        const existingItem = await prisma.item.findFirst({
          where: {
            name: item.name,
            ...fetchCondition,
          },
        });

        const updateFields: any = { price: item.price };

        if (
          item.subCategoryId &&
          item.subCategoryId !== existingItem?.subCategoryId
        ) {
          updateFields.subCategoryId = item.subCategoryId;
        }

        if (existingItem) {
          const updatedItem = await prisma.item.update({
            where: {
              id: existingItem.id,
            },
            data: updateFields,
          });

          // Pop item off the category
          const newBaseItemList = baseItemList.filter((item: Item) => {
            return item.name !== updatedItem.name;
          });
          baseItemList = newBaseItemList;
        } else {
          await prisma.item.create({
            data: {
              name: item.name,
              categoryId: userCategoryId,
              price: item.price,
              subCategoryId: item.subCategoryId,
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

      const existingCategory = await prisma.category.findUnique({
        where: {
          id: userCategoryId,
        },
        include: {
          users: {
            where: {
              subCategoryId: userSubCategoryId
            },
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
        return res.status(500).json({
          error: 'User Category Not Found',
        });
      }

      // Update schedule order accordingly
      const requireUpdateOrders = existingCategory.users.map((user: any) => {
        return user.scheduleOrders;
      }).flat();

      for (const scheduleOrder of requireUpdateOrders) {
        await updateScheduleOrderItems(updatedItems, scheduleOrder);
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

const formatUpdatedItems = async (
  categoryId: number = 0,
  updatedItems: any,
  subcategoryId: number = 0,
) => {
  const formattedUpdatedItems = await Promise.all(
    updatedItems.map(async (item: UpdatedItem) => {
      if (item?.subCategoryId && item.subCategoryId === subcategoryId) {
        return {
          name: item.name,
          price: item.price,
          categoryId: categoryId,
          subCategoryId: item.subCategoryId,
        };
      }
      return {
        name: item.name,
        price: item.price,
        categoryId: categoryId,
      };
    }),
  );

  return formattedUpdatedItems;
};

const generateScheduleOrderItems = (
  updatedItems: UpdatedItem[],
  scheduleOrder: any,
) => {
  const newItems = updatedItems.map((newItem: UpdatedItem) => {
    const { name, price, quantity } = newItem;
    const existingItem = scheduleOrder.items.find(
      (item: OrderedItems) => item.name === newItem.name,
    );

    if (existingItem) {
      return {
        name,
        price,
        quantity: existingItem.quantity,
        scheduledOrderId: scheduleOrder.id,
      };
    }
    return { name, price, quantity, scheduledOrderId: scheduleOrder.id };
  });

  return newItems;
};

const updateScheduleOrderItems = async (
  updatedItems: UpdatedItem[],
  scheduleOrder: any,
) => {
  const prisma = new PrismaClient();
  // Get new items and apply quantity from schedule order
  const newItems: any = generateScheduleOrderItems(updatedItems, scheduleOrder);

  // remove all items of schedule order
  await prisma.orderedItems.deleteMany({
    where: {
      scheduledOrderId: scheduleOrder.id,
    },
  });

  // add new items with target schedule order
  await prisma.orderedItems.createMany({
    data: newItems,
  });

  const newTotalPrice: number = newItems.reduce(
    (acc: number, newItem: OrderedItems) => {
      const itemTotalPrice = newItem.price * newItem.quantity;
      return acc + itemTotalPrice;
    },
    0,
  );

  await prisma.scheduleOrders.update({
    where: {
      id: scheduleOrder.id,
    },
    data: {
      totalPrice: newTotalPrice,
    },
  });
};
