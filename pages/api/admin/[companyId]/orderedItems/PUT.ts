/* eslint-disable @typescript-eslint/no-unused-vars */
import { InventoryLogFrom, InventoryLogType } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  restockInventoryItem,
  subtractInventoryItem,
  updateSingleInventoryItem,
} from './single';
import { gstRate, pstRate } from '@/app/lib/constant';
import { USER_ROLE } from '@/app/utils/enum';
import {
  calculateProfit,
  createOrderedItems,
} from '@/pages/api/utils/orderedItems';
import { getTodayDate } from '@/pages/api/utils/date';
import {
  checkOrderValidToAffectInventory,
  formatItemsWithTotalPrice,
} from '@/pages/api/utils/order';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { recordAction } from '@/pages/api/utils/timeline';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';
import { sendEmail } from '@/pages/api/utils/email';
import prisma from '@/client';
import { enqueueEmail } from '@/app/lib/queue';

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
      select: {
        id: true,
        companyId: true,
        deliveryDate: true,
        orderTime: true,
        createdBy: true,
        updatedBy: true,
        note: true,
        status: true,
        hasSubtractInventory: true,
        items: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            option: true,
            inventoryUnitId: true,
            inventoryUnit: true,
            inventoryItem: true,
            fifo: true,
          },
        },
        user: true,
      },
    });

    if (!existingOrder) {
      return res.status(400).json({ error: 'Order not found' });
    }

    // Track order items
    // const orderedItemList = await prisma.orderedItems.findMany({
    //   where: {
    //     orderId,
    //   },
    //   include: {
    //     fifo: true,
    //     inventoryUnit: true,
    //     inventoryItem: true,
    //     Orders: true,
    //   },
    // });
    const orderedItemList = existingOrder.items;

    // Categorize updated items into create, update, delete
    const newItems = categorizeUpdatedItems(
      Number(companyId),
      orderedItemList,
      updatedItems,
    );

    const isValidToAffectInventory = await checkOrderValidToAffectInventory(
      existingOrder?.companyId || 1,
      existingOrder.deliveryDate,
    );

    const creates = newItems.filter(
      (item: any) => item.type === ITEM_CATEGORIZED.CREATE,
    );
    const updates = newItems.filter(
      (item: any) => item.type === ITEM_CATEGORIZED.UPDATE,
    );
    const deletes = newItems.filter(
      (item: any) => item.type === ITEM_CATEGORIZED.DELETE,
    );

    // Create new log lines
    const toLines = (item: any) =>
      `x${item.quantity} ${item.name} ($${item.price})`;
    const createLines = creates.map(toLines);
    const updateLines = updates.map(toLines);
    const deleteLines = deletes.map(toLines);

    // Delete items first
    await prisma.$transaction(async (tx) => {
      if (deletes.length > 0) {
        await tx.orderedItems.deleteMany({
          where: {
            id: {
              in: deletes.map((item: any) => item.id),
            },
          },
        });

        if (isValidToAffectInventory) {
          for (const item of deletes) {
            if (item?.fifo && item?.inventoryUnit) {
              await restockInventoryItem(
                orderId,
                item.fifo,
                item.inventoryUnit,
                item.quantity,
              );

              await recordOrderInventoryLog(
                orderId,
                item?.fifo?.inventoryItemId,
                item.quantity,
                InventoryLogType.RESTOCK,
                InventoryLogFrom.EDIT_ORDER,
                `Restock ${item.quantity} ${item?.inventoryItem?.name} to inventory due to order ${orderId} removed ${item.name}`,
              );
            }
          }
        }
      }
      // Create new items
      if (creates.length > 0) {
        await Promise.allSettled(
          creates.map(async (item: any) => {
            await createOrderedItems(Number(companyId), existingOrder as any, [
              item,
            ]);
          }),
        );
      }

      // Update items
      if (updates.length > 0) {
        await Promise.allSettled(
          updates.map(async (item: any) => {
            const cost =
              (item?.cost / (item?.inventoryUnit?.ratio || 1)) *
              (item?.inventoryUnit?.ratio || 1);
            const profit = calculateProfit(item, cost);

            await tx.orderedItems.update({
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

            if (item?.fifo && item?.inventoryUnit && isValidToAffectInventory) {
              const difference = item.quantity - item.prevQuantity;
              const isRestock = difference < 0;
              await updateSingleInventoryItem(
                orderId,
                item.fifo,
                item.inventoryUnit,
                item.quantity,
                item.prevQuantity,
                item?.prevInventoryUnit,
              );

              await recordOrderInventoryLog(
                orderId,
                item?.fifo?.inventoryItemId,
                Math.abs(difference),
                isRestock
                  ? InventoryLogType.RESTOCK
                  : InventoryLogType.SUBTRACT,
                InventoryLogFrom.EDIT_ORDER,
                `${isRestock ? 'Restock' : 'Subtract'} ${Math.abs(difference)} ${item?.inventoryItem?.name} (item update)`,
              );
            }
          }),
        );
      }
    }, {
      timeout: 20000,
    });

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    // Single action record in one comment
    let comment = '';
    if (createLines.length)
      comment += `### Create\n${createLines.join('\n')}\n`;
    if (updateLines.length)
      comment += `### Update\n${updateLines.join('\n')}\n`;
    if (deleteLines.length)
      comment += `### Remove\n${deleteLines.join('\n')}\n`;

    if (comment) {
      await recordAction(
        orderId,
        createdBy,
        `${createdBy} edited this order`,
        comment,
      );
    }

    // Recompute totals & perform one order update (not multiple)
    //   Re-fetch items minimally (or reuse in-memory if your create/update code returns them)
    const orderedItems = await prisma.orderedItems.findMany({
      where: { orderId },
      select: {
        id: true,
        price: true,
        quantity: true,
        prevPrice: true,
        isShowDiscount: true,
        inventoryItem: { select: { hasPST: true, hasGST: true, name: true } },
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
        updatedBy: createdBy,
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

    const deliveryDateChanged = deliveryDate !== existingOrder.deliveryDate;
    const noteChanged = note !== existingOrder.note;

    let hasSubtractInventory = existingOrder.hasSubtractInventory;

    if (deliveryDateChanged) {
      if (
        new Date(deliveryDate) < new Date(existingOrder.deliveryDate) &&
        !hasSubtractInventory
      ) {
        for (const item of orderUpdated.items) {
          if (item?.fifo && item?.inventoryUnit) {
            await subtractInventoryItem(
              orderId,
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );

            // Record inventory log
            await recordOrderInventoryLog(
              orderId,
              item?.fifo?.inventoryItemId,
              item.quantity,
              InventoryLogType.SUBTRACT,
              InventoryLogFrom.EDIT_ORDER,
              `Subtract ${item.quantity} ${item?.inventoryItem?.name} from inventory due to order ${orderId} delivery date from ${existingOrder.deliveryDate} to ${deliveryDate} update`,
            );
          }
        }
      }

      if (new Date(deliveryDate) > new Date(existingOrder.deliveryDate)) {
        // move later -> restock now
        for (const item of orderUpdated.items) {
          if (item?.fifo && item?.inventoryUnit) {
            await restockInventoryItem(
              orderId,
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );
            await recordOrderInventoryLog(
              orderId,
              item?.fifo?.inventoryItemId,
              item.quantity,
              InventoryLogType.RESTOCK,
              InventoryLogFrom.EDIT_ORDER,
              `Restock ${item.quantity} ${item?.inventoryItem?.name}: delivery moved ${existingOrder.deliveryDate} → ${deliveryDate}`,
            );
          }
        }
        hasSubtractInventory = false;

        // clear reassignment for old date
        await prisma.reassignment.deleteMany({
          where: { orderId, date: existingOrder.deliveryDate },
        });
      }
    }

    // Secondary action log for delivery/note changes (only if changed)
    if (deliveryDateChanged || noteChanged) {
      let extra = '';
      if (deliveryDateChanged)
        extra += `### Delivery date\n${existingOrder.deliveryDate} -> ${deliveryDate}\n`;
      if (noteChanged) extra += `### Note\n${note}\n`;
      await recordAction(
        orderId,
        createdBy,
        `${createdBy} edited this order`,
        extra,
      );
    }

    // Notify Email for client
    if (
      existingOrder?.user?.email &&
      !existingOrder?.user?.email.includes('INACTIVE')
    ) {
      await enqueueEmail(
        {
          user: existingOrder?.user,
          order: orderUpdated,
          orderId,
          deliveryDate,
          note,
          subjectTag: 'EDIT ORDER',
        }
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
  const baseById = new Map<number, any>();
  const seen = new Set<number>();

  const results: any[] = [];

  for (const baseItem of baseItems) {
    baseById.set(baseItem[comparedField], baseItem);
  }

  for (const updatedItem of updatedItems) {
    const baseItem = baseById.get(updatedItem[comparedField]);

    if (baseItem) {
      seen.add(updatedItem[comparedField]);

      const priceChanged = updatedItem.price !== baseItem?.price;
      const qtyChanged = updatedItem.quantity !== baseItem?.quantity;
      const unitChanged =
        updatedItem.inventoryUnitId !== baseItem?.inventoryUnitId;
      const optNameChanged =
        (updatedItem?.option?.name ?? null) !==
        (baseItem?.option?.name ?? null);

      if (priceChanged || qtyChanged || unitChanged || optNameChanged) {
        results.push({
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
        });
      } else {
        results.push({
          ...baseItem,
          type: ITEM_CATEGORIZED.REMAIN,
        });
      }
    } else {
      results.push({
        ...updatedItem,
        companyId,
        type: ITEM_CATEGORIZED.CREATE,
      });
    }
  }

  // Delete items that are not in the updated items
  for (const baseItem of baseItems) {
    if (!seen.has(baseItem[comparedField])) {
      results.push({
        ...baseItem,
        type: ITEM_CATEGORIZED.DELETE,
      });
    }
  }

  return results;
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

      if (item?.isShowDiscount && item?.prevPrice > 0) {
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
