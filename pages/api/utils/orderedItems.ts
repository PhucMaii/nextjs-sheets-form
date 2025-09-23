import {
  InventoryLogFrom,
  InventoryLogType,
  Orders,
} from '@prisma/client';
import { checkOrderValidToAffectInventory } from './order';
import { getTodayDate, sortByDeliveryDate } from './date';
import { getAllUnitsByInventoryItemId } from './units';
import { checkAndUpdateUnits } from '../admin/[companyId]/inventory/expenses/POST';
import { recordAction } from './timeline';
import { recordOrderInventoryLog } from './logs';
import prisma from '@/client';
import { subtractRelatedInternalItem } from '../admin/[companyId]/orderedItems/single';

export const createOrderedItems = async (
  companyId: number,
  order: Orders,
  items: any,
  createdBy: string = '',
) => {
  // STEP 1: Loop through each item
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      companyId,
    },
    include: {
      vendorItem: {
        include: {
          unit: true,
        },
      },
      fifo: {
        include: {
          vendorItem: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  });

  // // Check is order valid to affect inventory
  const isValidToCheckInventory = await checkOrderValidToAffectInventory(
    companyId,
    order.deliveryDate,
  );

  let comment = '### Items\n'; // Comment of order action
  const newOrderedItems = [];
  const allDeletedFifoIds = [];
  for (const item of items) {
    const targetedItem = inventoryItems.find(
      (inventoryItem) => inventoryItem.id === item.inventoryItemId,
    );

    // Custom Amount Not Link With Inventory
    if (!targetedItem && item.isCustomAmount) {
      newOrderedItems.push({
        orderId: order.id,
        name: item.name,
        price: item.price,
        cost: item.cost,
        profit: item.price - item.cost,
        quantity: item.quantity,
        isCustomAmount: item.isCustomAmount,
        companyId,
      });
      continue;
    }

    if (!targetedItem) {
      console.error('Conflict Inventory Item Not Found');
      continue;
    }

    // If item is custom amount and is assigned to a new unit
    let unitId = item?.option?.unitId || item.inventoryUnitId;

    if (item.inventoryUnitId < 1) {
      const dbUnits = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: item.inventoryUnit.vendorItemId,
        },
      });
      const updatedAt = getTodayDate();
      await checkAndUpdateUnits(
        companyId,
        dbUnits,
        item.units,
        item.inventoryUnit.vendorItemId,
        `${updatedAt.date} ${updatedAt.time}`,
        createdBy,
      );

      const targetUnit = await prisma.inventoryUnit.findFirst({
        where: {
          vendorItemId: item.inventoryUnit.vendorItemId,
          ratio: item.inventoryUnit.ratio,
          companyId,
        },
      });

      unitId = targetUnit?.id;
    }

    const allUnits = await getAllUnitsByInventoryItemId(item.inventoryItemId);
    const itemUnit = allUnits?.find((unit: any) => unit.id === unitId);

    // console.log({ targetedItem, item }, 'targetedItem');
    // CASE 1:Check if vendor item has no batch
    if (targetedItem.fifo.length === 0) {
      // if (isValidToCheckInventory) {
      const newFifo = await prisma.fifo.create({
        data: {
          inventoryItemId: targetedItem.id,
          vendorItemId: targetedItem.vendorItem[0].id,
          quantity: isValidToCheckInventory
            ? -(item.quantity * (itemUnit?.ratio || 1)) // quantity * ratio
            : 0,
          createdAt: order.orderTime,
          createdBy: order?.createdBy || '',
          companyId,
        },
        include: {
          vendorItem: true,
        },
      });

      comment += `x${item.quantity} ${item.name}\n`;

      // Update vendor item quantity
      await prisma.vendorItem.update({
        where: {
          id: targetedItem.vendorItem[0].id,
        },
        data: {
          quantity: isValidToCheckInventory
            ? -item.quantity * (itemUnit?.ratio || 1)
            : 0,
        },
      });

      // const unitRatioOf1 = targetedItem.vendorItem[0].unit.find((unit) => {
      //   return unit.ratio === 1;
      // });

      // Because there is no batch, calculate profit based on unitPrice
      newOrderedItems.push({
        orderId: order.id,
        fifoId: newFifo.id,
        // optionId: item?.optionId || null,
        option: {
          name: item?.option?.name || '',
          price: item?.option?.price || 0,
          ratio: itemUnit?.ratio || 1,
          prevPrice: item?.option?.prevPrice,
          isShowDiscount: item?.option?.isShowDiscount,
        },
        cost: itemUnit?.unitPrice || 0,
        profit: item.price - (itemUnit?.unitPrice || 0),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        inventoryUnitId: unitId,
        inventoryItemId: item.inventoryItemId,
        isCustomAmount: item?.isCustomAmount || false,
        companyId,
      });

      if (isValidToCheckInventory) {
        // Subtract related internal item
        await subtractRelatedInternalItem(item.inventoryItemId, item.quantity);

        // Record inventory log
        await recordOrderInventoryLog(
          order.id,
          item.inventoryItemId,
          item.quantity,
          InventoryLogType.SUBTRACT,
          InventoryLogFrom.CREATE_ORDER,
          `Subtract ${item.quantity} ${item.name} from inventory due to order ${order.id} created or updated`,
        );
      }
      // }
    } else {
      // CASE 2: Check if vendor item has batch
      // STEP 2: Get and Sorted from latest date all FIFO from inventory item
      const itemFifo = targetedItem.fifo.map((fifo) => {
        const createdAt = fifo.createdAt.split(' ')[1];
        return { ...fifo, createdAt };
      });

      // Descending fifo - first item would be the latest
      const sortedFifo = sortByDeliveryDate(itemFifo, 'createdAt');
      if (isValidToCheckInventory) {
        // STEP 3: Use while loop to identify which fifo should be used
        //   itemQuantity = item.quantity * item.unit.ratio
        //   while (itemQuantity >= fifo.quantity)
        //     move to next FIFO
        let fifoIndex = 0;
        const deletedFifoIds = [];

        const itemRatio =
          itemUnit?.ratio || item?.option?.ratio || item.inventoryUnit.ratio;

        let itemQuantity = item.quantity * itemRatio; // Check from the unit ratio

        // If item quantity is greater than the fifo quantity, delete the fifo, and move to next fifo with new quantity subtracted
        while (fifoIndex < sortedFifo.length - 1) {
          if (itemQuantity >= sortedFifo[fifoIndex].quantity) {
            deletedFifoIds.push(sortedFifo[fifoIndex].id);
            itemQuantity -= sortedFifo[fifoIndex].quantity;
            fifoIndex++;
          } else {
            break;
          }
        }

        // STEP 4: fifo.quantity - itemQuantity
        // If users order more than stock has - fifoIndex should reach the second last item
        await prisma.fifo.update({
          where: {
            id: sortedFifo[fifoIndex].id,
          },
          data: {
            quantity: sortedFifo[fifoIndex].quantity - itemQuantity,
          },
        });

        comment += `x${item.quantity} ${item.name}\n`;

        // STEP 5: vendorItem.quantity - (item.quantity * item.inventoryUnit.ratio)
        // Update Vendor Item Quantity
        const targetVendorItem = await prisma.vendorItem.findFirst({
          where: {
            id: sortedFifo[fifoIndex].vendorItemId,
          },
        });

        if (!targetVendorItem) {
          console.error('COnflict vendor item');
          continue;
        }

        await prisma.vendorItem.update({
          where: {
            id: sortedFifo[fifoIndex].vendorItemId,
          },
          data: {
            quantity: targetVendorItem.quantity - item.quantity * itemRatio,
          },
        });

        // Move all old ordered items to the current fifo
        await prisma.orderedItems.updateMany({
          where: {
            fifoId: {
              in: deletedFifoIds,
            },
          },
          data: {
            fifoId: sortedFifo[fifoIndex].id,
          },
        });

        allDeletedFifoIds.push(...deletedFifoIds);

        // If calculate by fifo, need to multiply with ratio since fifo is ratio of 1
        const cost = sortedFifo[fifoIndex]?.price
          ? sortedFifo[fifoIndex].price * itemUnit.ratio
          : itemUnit?.unitPrice || 0;

        // STEP 6: Create ordered item with that fifo id attached
        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[fifoIndex].id,
          // optionId: item?.optionId || null,
          option: {
            name: item?.option?.name || '',
            price: item?.option?.price || 0,
            ratio: itemUnit?.ratio || 1,
            prevPrice: item?.option?.prevPrice,
            isShowDiscount: item?.option?.isShowDiscount,
          },
          companyId,
          name: item.name,
          cost: cost,
          profit: item.price - cost,
          price: item.price,
          quantity: item.quantity,
          isShowDiscount: item?.isShowDiscount,
          prevPrice: item?.prevPrice,
          inventoryUnitId: unitId,
          inventoryItemId: item.inventoryItemId,
          isCustomAmount: item?.isCustomAmount || false,
        });

        // Subtract related internal item
        await subtractRelatedInternalItem(item.inventoryItemId, item.quantity);

        // Record inventory log
        await recordOrderInventoryLog(
          order.id,
          item.inventoryItemId,
          itemQuantity,
          InventoryLogType.SUBTRACT,
          InventoryLogFrom.CREATE_ORDER,
          `Subtract ${itemQuantity} ${item.name} from inventory due to order ${order.id} created or updated`,
        );
      } else {
        // If no valid to check inventory, use the first fifo
        const cost = sortedFifo[0]?.price
          ? sortedFifo[0].price * itemUnit?.ratio
          : itemUnit?.unitPrice || 0;

        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[0].id,
          // optionId: item?.optionId || null,
          option: {
            name: item?.option?.name || '',
            price: item?.option?.price || 0,
            ratio: itemUnit?.ratio || 1,
            prevPrice: item?.option?.prevPrice,
            isShowDiscount: item?.option?.isShowDiscount,
          },
          name: item.name,
          cost: cost,
          profit: item.price - cost,
          price: item.price,
          quantity: item.quantity,
          isShowDiscount: item?.isShowDiscount,
          prevPrice: item?.prevPrice,
          inventoryUnitId: unitId,
          inventoryItemId: item.inventoryItemId,
          isCustomAmount: item?.isCustomAmount || false,
          companyId,
        });
      }
    }

    if (allDeletedFifoIds.length > 0) {
      await prisma.fifo.deleteMany({
        where: {
          id: {
            in: allDeletedFifoIds,
          },
        },
      });
    }
  }

  // Record actions
  const totalQty = newOrderedItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  if (isValidToCheckInventory && comment) {
    await recordAction(
      order.id,
      createdBy,
      `Subtract ${totalQty} items from inventory`,
      comment,
    );
  }

  await prisma.orderedItems.createMany({
    data: newOrderedItems,
  });

  return newOrderedItems;
};
