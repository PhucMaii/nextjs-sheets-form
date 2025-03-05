import { Orders, PrismaClient } from "@prisma/client";
import { checkOrderValidToAffectInventory } from "./order";
import { getTodayDate, sortByDeliveryDate } from "./date";
import { checkAndUpdateUnits } from "../admin/inventory/expenses/POST";
import { getAllUnitsByInventoryItemId } from "./units";

export const createOrderedItems = async (
  order: Orders,
  items: any,
  createdBy: string = '',
) => {
  const prisma = new PrismaClient();

  // STEP 1: Loop through each item
  const inventoryItems = await prisma.inventoryItem.findMany({
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
    order.deliveryDate,
  );

  const newOrderedItems = [];
  const allDeletedFifoIds = [];
  for (const item of items) {
    const targetedItem = inventoryItems.find(
      (inventoryItem) => inventoryItem.id === item.inventoryItemId,
    );

    // console.log(item, 'item');

    if (!targetedItem && item.isCustomAmount) {
      newOrderedItems.push({
        orderId: order.id,
        name: item.name,
        price: item.price,
        cost: item.cost,
        profit: item.price - item.cost,
        quantity: item.quantity,
        isCustomAmount: item.isCustomAmount,
      });
      continue;
    }

    if (!targetedItem) {
      console.error('Conflict Inventory Item Not Found');
      continue;
    }

    // If item is custom amount and is assigned to a new unit
    let unitId = item.inventoryUnitId;

    if (item.inventoryUnitId < 1) {
      const dbUnits = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: item.inventoryUnit.vendorItemId,
        },
      });
      const updatedAt = getTodayDate();
      await checkAndUpdateUnits(
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
        },
      });

      unitId = targetUnit?.id;
    }

    const allUnits = await getAllUnitsByInventoryItemId(item.inventoryItemId);
    const itemUnit = allUnits?.find((unit: any) => unit.id === unitId);

    // console.log({ targetedItem, item }, 'targetedItem');
    // CASE 1:Check if vendor item has no batch
    if (targetedItem.fifo.length === 0) {
      const newFifo = await prisma.fifo.create({
        data: {
          inventoryItemId: targetedItem.id,
          vendorItemId: targetedItem.vendorItem[0].id,
          quantity: isValidToCheckInventory ? -item.quantity : 0,
          createdAt: order.orderTime,
          createdBy: order?.createdBy || '',
        },
        include: {
          vendorItem: true,
        },
      });

      // Update vendor item quantity
      if (isValidToCheckInventory) {
        await prisma.vendorItem.update({
          where: {
            id: targetedItem.vendorItem[0].id,
          },
          data: {
            quantity: -item.quantity,
          },
        });
      }

      // const unitRatioOf1 = targetedItem.vendorItem[0].unit.find((unit) => {
      //   return unit.ratio === 1;
      // });

      newOrderedItems.push({
        orderId: order.id,
        fifoId: newFifo.id,
        cost: itemUnit?.unitPrice || 0,
        profit: item.price - (itemUnit?.unitPrice || 0),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        inventoryUnitId: unitId,
        inventoryItemId: item.inventoryItemId,
        isCustomAmount: item?.isCustomAmount || false,
      });
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

        let itemQuantity = item.quantity * item.inventoryUnit.ratio;
        // let fifoQuantityLeft = itemQuantity;
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
            quantity:
              targetVendorItem.quantity -
              item.quantity * item.inventoryUnit.ratio,
          },
        });

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

        const cost = sortedFifo[fifoIndex]?.price
          ? sortedFifo[fifoIndex].price * itemUnit?.ratio
          : itemUnit?.unitPrice || 0;

        console.log(itemUnit, 'item unit');
        console.log(sortedFifo[fifoIndex].price, 'sortedFifo[fifoIndex].price');

        // STEP 6: Create ordered item with that fifo id attached
        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[fifoIndex].id,
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
      } else {
        const cost = sortedFifo[0]?.price
          ? sortedFifo[0].price
          : itemUnit?.unitPrice || 0;

        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[0].id,
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

  await prisma.orderedItems.createMany({
    data: newOrderedItems,
  });

  return newOrderedItems;
};