/* eslint-disable @typescript-eslint/no-unused-vars */
import { InventoryLogFrom, InventoryLogType, Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { restockInventoryItem, updateSingleInventoryItem } from './single';
import { gstRate, pstRate } from '@/app/lib/constant';
import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { calculateProfit, createOrderedItems } from '@/pages/api/utils/orderedItems';
import { getTodayDate } from '@/pages/api/utils/date';
import { checkOrderValidToAffectInventory, formatItemsWithTotalPrice } from '@/pages/api/utils/order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { recordAction } from '@/pages/api/utils/timeline';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';

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
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(404).json({
        error: 'Parameters are missing',
      });
    }
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
    const newItems = categorizeUpdatedItems(
      Number(companyId),
      orderedItemList,
      updatedItems,
    );

    const actionRecord: any = {
      create: [],
      update: [],
      delete: [],
    };

    const isValidToAffectInventory = await checkOrderValidToAffectInventory(
      existingOrder?.companyId || 1,
      existingOrder.deliveryDate,
    );

    console.log({ newItems }, 'newItems');
    for (const item of newItems) {
      // Check item categorize to create, update or delete

      // CREATE
      if (item.type === ITEM_CATEGORIZED.CREATE) {
        await createOrderedItems(Number(companyId), existingOrder, [item]);
        actionRecord.create.push(item);
        continue;
      } else if (item.type === ITEM_CATEGORIZED.REMAIN) {
        // REMAIN
        continue;
      } else if (item.type === ITEM_CATEGORIZED.DELETE) {
        // DELETE - force to delete first -> then restock
        await prisma.orderedItems.delete({
          where: {
            id: item.id,
          },
        });

        actionRecord.delete.push(item);

        if (item?.fifo && item?.inventoryUnit && isValidToAffectInventory) {
          await restockInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );

          // Record inventory log
          await recordOrderInventoryLog(
            item.orderId,
            item?.fifo?.inventoryItemId,
            item.quantity,
            InventoryLogType.RESTOCK,
            InventoryLogFrom.EDIT_ORDER,
            `Restock ${item.quantity} ${item?.inventoryItem?.name} to inventory due to order ${item.orderId} removed ${item.name}`,
          );
        }

        continue;
      } else {
        // UPDATE
        // const { cost } = await generateCostAndProfit(item.id);

        // Calculate cost: prevCost / prevRatio to get cost for ratio of 1 -> then multiply to new ratio
        const cost =
          (item?.cost / (item?.inventoryUnit?.ratio || 1)) *
          (item?.inventoryUnit?.ratio || 1);

        actionRecord.update.push(item);

        const profit = await calculateProfit(item, cost);

        await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: item.price,
            quantity: item.quantity,
            cost,
            profit,
            inventoryUnitId: item.inventoryUnitId,
            option: item.option,
          },
        });

        // Inventory Update

        if (
          item?.fifo &&
          item.inventoryUnit &&
          item?.Orders?.status !== ORDER_STATUS.VOID && isValidToAffectInventory
        ) {
          
          // Identify the difference between the previous quantity and the new quantity
          const difference = item.quantity - item.prevQuantity;

          const isRestock = difference < 0;

          await updateSingleInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
            item.prevQuantity,
            item?.prevInventoryUnit,
          );

          // Record inventory log
          await recordOrderInventoryLog(
            item.orderId,
            item?.fifo?.inventoryItemId,
            Math.abs(difference),
            isRestock ? InventoryLogType.RESTOCK : InventoryLogType.SUBTRACT,
            InventoryLogFrom.EDIT_ORDER,
            `${isRestock ? 'Restock' : 'Subtract'} ${Math.abs(difference)} ${item?.inventoryItem?.name} to inventory due to order ${item.orderId} updated ${item.name}`,
          );
        }
      }
    }

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    const today = getTodayDate();

    let comment = '';

    if (actionRecord.create.length > 0) {
      comment += `### Create\n ${actionRecord.create.map((item: any) => `x${item.quantity} ${item.name} ($${item.price})`).join('\n')}\n`;
    }
    if (actionRecord.update.length > 0) {
      comment += `### Update\n ${actionRecord.update.map((item: any) => `x${item.quantity} ${item.name} ($${item.price})`).join('\n')}\n`;
    }
    if (actionRecord.delete.length > 0) {
      comment += `### Remove\n ${actionRecord.delete.map((item: any) => `x${item.quantity} ${item.name} ($${item.price})`).join('\n')}\n`;
    }

    await recordAction(
      orderId,
      createdBy,
      `${createdBy} edited this order`,
      comment,
    );

    // Get admin update info
    const session: any = await getServerSession(req, res, authOptions);
    const adminUpdate: any = session?.user;
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
        updatedBy: `Admin - ${adminUpdate.name}`,
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

    if (
      deliveryDate !== existingOrder.deliveryDate ||
      note !== existingOrder.note
    ) {
      let comment: string = '';

      if (deliveryDate !== existingOrder.deliveryDate) {
        comment += `### Delivery date\n${existingOrder.deliveryDate} -> ${deliveryDate}\n`;

        // If delivery date is changed, remove the reassignment if any
      }

      if (note !== existingOrder.note) {
        comment += `### Note\n${note}\n`;
      }
      // Create order action of update delivery date
      await recordAction(
        orderId,
        createdBy,
        `${createdBy} edited this order`,
        comment,
      );
    }

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
  companyId: number,
  baseItems: any,
  updatedItems: any,
  comparedField: string = 'id',
) => {
  let trackBaseItems = [...baseItems];

  const newItems = updatedItems.map((updatedItem: any) => {
    const baseItem = baseItems.find((item: any) => {
      return item[comparedField] === updatedItem[comparedField];
    });

    if (updatedItem?.option?.name) {
      console.log({ updatedItem }, 'updatedItem?.option?.name');
    }

    if (baseItem) {
      console.log({ baseItem, updatedItem });
      trackBaseItems = trackBaseItems.filter((item: any) => {
        return item[comparedField] !== updatedItem[comparedField];
      });

      if (
        baseItem.quantity !== updatedItem.quantity ||
        updatedItem.price !== baseItem.price ||
        updatedItem.inventoryUnitId !== baseItem.inventoryUnitId ||
        updatedItem?.option?.name !== baseItem?.option?.name
      ) {
        return {
          ...baseItem,
          prevInventoryUnit: baseItem.inventoryUnit,
          inventoryUnitId: updatedItem.inventoryUnitId,
          inventoryUnit: updatedItem.inventoryUnit,
          quantity: updatedItem.quantity,
          prevQuantity: baseItem.quantity,
          price: updatedItem.price,
          type: ITEM_CATEGORIZED.UPDATE,
          option: {
            name: updatedItem?.option?.name,
            price: updatedItem?.option?.price,
            ratio: updatedItem?.inventoryUnit?.ratio,
            prevPrice: updatedItem?.option?.prevPrice,
            isShowDiscount: updatedItem?.option?.isShowDiscount,
          },
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
        companyId,
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

export const generateOrderTotalPrice = (
  listOfItems: any[],
  shippingFee: number = 0,
) => {
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
      totalPrice: total.subTotal + total.PST + total.GST + shippingFee,
      shippingFee,
    };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};
