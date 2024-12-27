/* eslint-disable @typescript-eslint/no-unused-vars */
import { Item, OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import { updateSingleInventoryItem } from './single';
import { createOrderedItems } from '../inventory/expenses/POST';
import { gstRate, pstRate } from '@/app/lib/constant';
import { IItem } from '@/app/utils/type';
import { generateCurrentTime } from '@/app/utils/time';
import { getDifferentItems } from '@/app/utils/array';
import { ORDER_STATUS } from '@/app/utils/enum';

interface UpdatedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  orderId: number;
  totalPrice: number;
  inventoryItemId?: number;
  inventoryUnitId?: number;
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
  userId: number;
  userCategoryId: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      updateOption,
      categoryName,
      userId,
      userCategoryId,
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
    const orderedItemList = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
      include: {
        fifo: true,
        inventoryUnit: true,
        inventoryItem: true,
        Orders: true,
      },
    });

    const acutalUpdatedItems = getDifferentItems(
      updatedItems,
      orderedItemList,
      ['quantity', 'price'],
    );

    console.log(acutalUpdatedItems, 'acutalUpdatedItems');

    for (const item of acutalUpdatedItems) {
      // Check does system has that item
      const existingItem = orderedItemList.find((orderedItem: OrderedItems) => {
        return item.id === orderedItem.id;
      });

      if (!existingItem) {
        return res.status(404).json({
          error: `Item ${item.name} with price of ${item.price} Not Found`,
        });
      }

      await prisma.orderedItems.update({
        where: {
          id: item.id,
        },
        data: {
          price: item.price,
          quantity: item.quantity,
        },
      });

      // Inventory Update
      if (
        existingItem?.fifo &&
        existingItem.inventoryUnit &&
        existingItem?.Orders?.status !== ORDER_STATUS.VOID
      ) {
        await updateSingleInventoryItem(
          item.orderId,
          existingItem.fifo,
          existingItem.inventoryUnit,
          item.quantity,
          existingItem.quantity,
        );
      }
    }

    // Get admin update info
    const adminUpdate: any = await getUserInfo(req, res);
    // await updateOrderTotalPrice(
    //   orderId,
    //   newTotalPrice,
    //   `Admin - ${adminUpdate.clientName}`,
    // );

    const orderedItems = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
      include: {
        fifo: true,
        inventoryItem: true,
        inventoryUnit: true,
      },
    });
    const orderTotalPrice = generateOrderTotalPrice(orderedItems);
    const updatedAt = new Date();

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        updatedBy: `Admin - ${adminUpdate.clientName}`,
        updateTime: updatedAt,
      },
    });

    // First case: No update neither create new category
    if (updateOption === UpdateOption.NONE || !updateOption) {
      return res.status(200).json({
        message: 'Update Data Successfully',
      });
    }

    // Second case: if user want to create new category
    if (updateOption === UpdateOption.CREATE) {
      if (!categoryName || categoryName.trim() === '') {
        return res.status(404).json({
          error: 'Category Name Must Not Be Blank',
        });
      }

      const newCategory = await prisma.category.create({
        data: {
          name: categoryName,
        },
      });

      const formattedUpdatedItems = formatUpdatedItems(
        newCategory.id,
        updatedItems,
        // userSubCategoryId,
      );

      // create new items
      await prisma.item.createMany({
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
        targetClient.scheduleOrders &&
        targetClient.scheduleOrders.length > 0
      ) {
        // Update schedule order of this client
        for (const scheduleOrder of targetClient.scheduleOrders) {
          await updateScheduleOrderItems(updatedItems, scheduleOrder, userId);
        }
      }

      const returnOrder = await prisma.orders.findUnique({
        where: {
          id: orderId,
        },
        include: {
          user: true,
          items: true,
        },
      });

      return res.status(200).json({
        data: {
          category: newCategory,
          ...returnOrder?.user,
          ...returnOrder,
        },
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

      let fetchCondition: any = { categoryId: userCategoryId };

      // Get the rest of items
      const itemList = await prisma.item.findMany({
        where: {
          categoryId: userCategoryId,
          // subCategoryId: null,
        },
      });

      let baseItemList = [...itemList];

      for (const item of updatedItems) {
        fetchCondition = { categoryId: userCategoryId };
        const existingItem = await prisma.item.findFirst({
          where: {
            name: item.name,
            ...fetchCondition,
          },
        });

        const updateFields: any = { price: item.price };

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
              availability: true,
              inventoryItemId: item?.inventoryItemId,
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
      const requireUpdateOrders = existingCategory.users
        .map((user: any) => {
          return user.scheduleOrders.map((scheduleOrder: any) => {
            return scheduleOrder;
          });
        })
        .flat();

      if (requireUpdateOrders && requireUpdateOrders.length > 0) {
        for (const scheduleOrder of requireUpdateOrders) {
          if (scheduleOrder) {
            await updateScheduleOrderItems(
              updatedItems,
              scheduleOrder,
              // scheduleOrder.subCategoryId,
              // userSubCategoryId,
              userId,
            );
          }
        }
      }

      return res.status(200).json({
        message: 'Category Price Updated Succesfully',
      });
    }
    return res.status(200).json({
      message: 'Updating Progress Has Done',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const generateOrderTotalPrice = (listOfItems: any[]) => {
  try {
    const total = listOfItems.reduce((acc: any, item: any) => {
      if (!acc?.subTotal) {
        acc.subTotal = 0;
      }

      if (!acc?.totalWithoutDiscount) {
        acc.totalWithoutDiscount = 0;
      }

      if (!acc?.PST) {
        acc.PST = 0;
      }

      if (!acc?.GST) {
        acc.GST = 0;
      }

      if (!acc?.discount) {
        acc.discount = 0;
      }

      acc.totalWithoutDiscount =
        (item?.isShowDiscount && item?.prevPrice
          ? item.prevPrice
          : item.price) * item.quantity;

      acc.subTotal += item.price * item.quantity;

      if (item?.inventoryItem?.hasPST) {
        acc.PST += item.price * item.quantity * pstRate;
      }

      if (item?.inventoryItem?.hasGST) {
        acc.GST += item.price * item.quantity * gstRate;
      }

      if (item?.isShowDiscount && item?.prevPrice) {
        acc.discount += (item.prevPrice - item.price) * item.quantity;
      }

      return acc;
    }, {});

    return {
      ...total,
      totalPrice: total.subTotal + total.PST + total.GST,
    };
    // const prisma = new PrismaClient();
    //   where: {
    //   },
    //   include: {
    //     items: true,
    //   },
    // });

    // const subTotal =

    // // const updatedOrder: any = await prisma.orders.update({
    // //   where: {
    // //     id: orderId,
    // //   },
    // //   data: {
    // //     totalPrice: newTotalPrice,
    // //     updatedBy,
    // //     updateTime,
    // //   },
    // //   include: {
    // //     items: true,
    // //     user: true,
    // //   },
    // // });

    // const newItems = updatedOrder.items.map((item: OrderedItems) => {
    //   const totalPrice = item.quantity * item.price;
    //   return { ...item, totalPrice };
    // });

    // return {
    //   ...updatedOrder,
    //   items: newItems,
    //   clientName: updatedOrder.user.clientName,
    //   clientId: updatedOrder.user.clientId,
    // };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

const formatUpdatedItems = (
  categoryId: number = 0,
  updatedItems: any,
  // subcategoryId: number = 0,
) => {
  const formattedUpdatedItems = updatedItems.map((item: UpdatedItem) => {
    return {
      name: item.name,
      price: item.price,
      categoryId: categoryId,
      availability: true,
      inventoryItemId: item?.inventoryItemId || null,
      inventoryUnitId: item?.inventoryUnitId || null,
    };
  });

  return formattedUpdatedItems;
};

const generateScheduleOrderItems = (
  updatedItems: UpdatedItem[],
  scheduleOrder: any,
  // subCategoryId: number | null,
  // baseSubCategoryId: number | null, // categoryId of the client update this category
  userId: number,
) => {
  const newItems = updatedItems.map((newItem: UpdatedItem) => {
    const { name, price, quantity } = newItem;

    const existingItem = scheduleOrder.items.find(
      (item: OrderedItems) => item.name === newItem.name,
    );

    // if (existingItem) {
    if (existingItem) {
      return {
        name,
        price,
        quantity: existingItem.quantity,
        scheduledOrderId: scheduleOrder.id,
        inventoryItemId: existingItem.inventoryItemId,
        inventoryUnitId: existingItem.inventoryUnitId,
      };
    }

    // // if item is beansprouts and different subCategoryId => use the existing price
    // if (subCategoryId !== baseSubCategoryId) {
    //   return {
    //     name,
    //     price: existingItem.price,
    //     quantity: existingItem.quantity,
    //     scheduledOrderId: scheduleOrder.id,
    //   };
    // }
    // }

    return {
      name,
      price,
      quantity: userId === scheduleOrder.userId ? quantity : 0,
      scheduledOrderId: scheduleOrder.id,
      inventoryItemId: newItem.inventoryItemId,
      inventoryUnitId: newItem.inventoryUnitId,
    };
  });

  return newItems;
};

const updateScheduleOrderItems = async (
  updatedItems: UpdatedItem[],
  scheduleOrder: any,
  userId: number,
) => {
  const prisma = new PrismaClient();
  // Get new items and apply quantity from schedule order
  const newItems: any = generateScheduleOrderItems(
    updatedItems,
    scheduleOrder,
    // subCategoryId,
    // baseSubCategoryId,
    userId,
  );

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
