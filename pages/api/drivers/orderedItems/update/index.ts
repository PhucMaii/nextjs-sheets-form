import { ORDER_STATUS } from '@/app/utils/enum';
import {
  categorizeUpdatedItems,
  generateOrderTotalPrice,
  ITEM_CATEGORIZED,
} from '@/pages/api/admin/[companyId]/orderedItems/PUT';
import {
  // generateCostAndProfit,
  restockInventoryItem,
  updateSingleInventoryItem,
} from '@/pages/api/admin/[companyId]/orderedItems/single';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';
import { checkOrderValidToAffectInventory, formatItemsWithTotalPrice } from '@/pages/api/utils/order';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import { recordAction } from '@/pages/api/utils/timeline';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { InventoryLogType, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { InventoryLogFrom } from '@prisma/client';

interface IBody {
  orderId: number;
  updatedItems: any[];
  note?: string;
  deliveryDate?: string;
  // updateOption?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      note,
      deliveryDate,
      // updateOption,
    } = updatedData as IBody;

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
      existingOrder?.companyId || -1,
      orderedItemList,
      updatedItems,
    );

    const actionRecord: any = {
      create: [],
      update: [],
      delete: [],
    };

    const isAffectInventory = await checkOrderValidToAffectInventory(
      existingOrder?.companyId || -1,
      existingOrder.deliveryDate,
    );

    for (const item of newItems) {
      // Check item categorize to create, update or delete

      // CREATE
      if (item.type === ITEM_CATEGORIZED.CREATE) {
        await createOrderedItems(
          existingOrder?.companyId || -1,
          existingOrder,
          [item],
        );
        actionRecord.create.push(item);
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

          actionRecord.delete.push(item);

          await restockInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );

          // Record inventory log
          if (isAffectInventory) {
            await recordOrderInventoryLog(
              item.orderId,
              item.fifo.inventoryItemId,
              item.quantity,
              InventoryLogType.RESTOCK,
              InventoryLogFrom.EDIT_ORDER,
              `Restock ${item.quantity} ${item?.inventoryItem?.name} to inventory due to order ${item.orderId} removed ${item.name}`,
            );
          }
        }

        continue;
      } else {
        // UPDATE
        // const { cost } = await generateCostAndProfit(item.id);

        const cost =
          (item?.cost / item?.inventoryUnit?.ratio) * item.inventoryUnit.ratio;

        await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: item.price,
            quantity: item.quantity,
            cost,
            profit: item.price - cost,
            inventoryUnitId: item.inventoryUnitId,
            option: item.option,
          },
        });

        actionRecord.update.push(item);

        // Inventory Update
        if (
          item?.fifo &&
          item.inventoryUnit &&
          item?.Orders?.status !== ORDER_STATUS.VOID &&
          isAffectInventory
        ) {
          const difference = item.quantity - item.prevQuantity;
          const isRestock = difference > 0;

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
            item.fifo.inventoryItemId,
            item.quantity,
            isRestock ? InventoryLogType.RESTOCK : InventoryLogType.SUBTRACT,
            InventoryLogFrom.EDIT_ORDER,
            `${isRestock ? 'Restock' : 'Subtract'} ${Math.abs(difference)} ${item?.inventoryItem?.name} to inventory due to order ${item.orderId} updated ${item.name}`,
          );
        }
      }
    }

    // Get admin update info
    const driverUpdate: any = await getDriverInfo(req, res);

    // Record actions
    const createdBy = `Driver - ${driverUpdate?.name}`;
    let comment = '';

    if (actionRecord.create.length > 0) {
      comment += `### Create\n ${actionRecord.create.map((item: any) => `x${item.quantity} ${item.name}`).join('\n')}\n`;
    }
    if (actionRecord.update.length > 0) {
      comment += `### Update\n ${actionRecord.update.map((item: any) => `x${item.quantity} ${item.name}`).join('\n')}\n`;
    }
    if (actionRecord.delete.length > 0) {
      comment += `### Remove\n ${actionRecord.delete.map((item: any) => `x${item.quantity} ${item.name}`).join('\n')}\n`;
    }

    await recordAction(
      orderId,
      createdBy,
      `${createdBy} edited this order`,
      comment,
    );

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
        updatedBy: `Driver - ${driverUpdate?.name}`,
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
};

export default withDriverAuthGuard(handler);
