/* eslint-disable @typescript-eslint/no-unused-vars */
import { Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import {
  generateCostAndProfit,
  restockInventoryItem,
  updateSingleInventoryItem,
} from './single';
import { gstRate, pstRate } from '@/app/lib/constant';
import { ORDER_STATUS } from '@/app/utils/enum';
import { getTodayDate } from '../../utils/date';
import {
  createOrderedItems,
  formatItemsWithTotalPrice,
} from '../../utils/order';

export enum ITEM_CATEGORIZED {
  REMAIN = 'remain',
  UPDATE = 'update',
  CREATE = 'create',
  DELETE = 'delete',
}

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
  note: string;
  deliveryDate: string;
  // updateOption?: UpdateOption;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      note,
      deliveryDate,
      // updateOption,
    } = updatedData as BodyType;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            fifo: true,
            inventoryUnit: true,
            inventoryItem: true,
          },
        },
        user: true,
      },
    });

    if (!existingOrder) {
      return res.status(400).json({ error: 'Order not found' });
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

    // Categorize updated items into create, update, delete
    const newItems = categorizeUpdatedItems(orderedItemList, updatedItems);

    for (const item of newItems) {
      // Check item categorize to create, update or delete

      // CREATE
      if (item.type === ITEM_CATEGORIZED.CREATE) {
        await createOrderedItems(existingOrder, [item]);
        continue;
      } else if (item.type === ITEM_CATEGORIZED.REMAIN) {
        // REMAIN
        continue;
      } else if (item.type === ITEM_CATEGORIZED.DELETE) {
        // DELETE
        if (item?.fifo && item?.inventoryUnit) {
          await prisma.orderedItems.delete({
            where: {
              id: item.id,
            },
          });

          await restockInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
        }

        continue;
      } else {
        // UPDATE
        const { cost } = await generateCostAndProfit(item.id);

        await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: item.price,
            quantity: item.quantity,
            cost,
            profit: item.price - cost,
          },
        });

        // Inventory Update
        if (
          item?.fifo &&
          item.inventoryUnit &&
          item?.Orders?.status !== ORDER_STATUS.VOID
        ) {
          await updateSingleInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
            item.quantity,
          );
        }
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
    const updatedAt = getTodayDate();
    const updateTime = new Date(`${updatedAt.date} ${updatedAt.time}`);

    const orderUpdated = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        note,
        deliveryDate,
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        discount: orderTotalPrice.discount,
        updatedBy: `Admin - ${adminUpdate.clientName}`,
        updateTime,
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
            fifo: true,
          },
        },
        user: {
          include: {
            category: true,
            routes: true,
            preference: true,
          },
        },
      },
    });

    const formattedItems = formatItemsWithTotalPrice(orderUpdated?.items);

    // First case: No update neither create new category
    // if (updateOption === UpdateOption.NONE || !updateOption) {
    return res.status(200).json({
      data: {
        ...orderUpdated?.user,
        ...orderUpdated,
        items: formattedItems,
      },
      message: 'Update Data Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const categorizeUpdatedItems = (
  baseItems: any,
  updatedItems: any,
  comparedField: string = 'id',
) => {
  let trackBaseItems = [...baseItems];

  const newItems = updatedItems.map((updatedItem: any) => {
    const baseItem = baseItems.find((item: any) => {
      return item[comparedField] === updatedItem[comparedField];
    });

    if (baseItem) {
      console.log({ baseItem, updatedItem });
      trackBaseItems = trackBaseItems.filter((item: any) => {
        return item[comparedField] !== updatedItem[comparedField];
      });

      if (
        baseItem.quantity !== updatedItem.quantity ||
        updatedItem.price !== baseItem.price
      ) {
        return {
          ...baseItem,
          quantity: updatedItem.quantity,
          price: updatedItem.price,
          type: ITEM_CATEGORIZED.UPDATE,
        };
      } else {
        return {
          ...baseItem,
          type: ITEM_CATEGORIZED.REMAIN,
        };
      }
    } else {
      return {
        ...updatedItem,
        type: ITEM_CATEGORIZED.CREATE,
      };
    }
  });

  const deletedItems = trackBaseItems.map((item: any) => {
    return {
      ...item,
      type: ITEM_CATEGORIZED.DELETE,
    };
  });

  return [...newItems, ...deletedItems];
};

export const generateOrderTotalPrice = (listOfItems: any[], shippingFee: number = 0) => {
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
    
    if (shippingFee > 0) {
      total.PST += shippingFee * pstRate;
      total.GST += shippingFee * gstRate;
    }

    return {
      ...total,
      totalPrice: total.subTotal + total.PST + total.GST,
      shippingFee,
    };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};
