import { NextApiRequest, NextApiResponse } from 'next';
import { Fifo, InventoryUnit, PrismaClient } from '@prisma/client';
import { generateOrderTotalPrice } from '../PUT';
import {
  checkOrderValidToAffectInventory,
  formatItemsWithTotalPrice,
} from '@/pages/api/utils/order';
import { getTodayDate, sortByDeliveryDate } from '@/pages/api/utils/date';
import { IInventoryUnit } from '@/app/utils/type';
import { getAllUnitsByInventoryItemId } from '@/pages/api/utils/units';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { recordAction } from '@/pages/api/utils/timeline';
import prisma from '@/client';

interface IBody {
  id: number;
  orderId: number;
  quantity: number;
  price: number;
  name?: string;
  inventoryUnit: IInventoryUnit;
  newUnits?: IInventoryUnit[];
  itemId?: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    console.log('req.body', req.body);

    const prisma = new PrismaClient();
    const { id, orderId, quantity, price, itemId } = req.body as IBody;

    let updatedOrderedItem;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Handle create new ordered items
    // WILL BE DELETED IN THE NEW VERSION

    if (id < 1 && itemId) {
      const targetItem = await prisma.item.findUnique({
        where: {
          id: itemId,
        },
        include: {
          inventoryItem: true,
          inventoryUnit: true,
        },
      });

      if (!targetItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      updatedOrderedItem = await createOrderedItems(
        Number(companyId),
        existingOrder,
        [{ ...targetItem, price, quantity }],
      );
    } else {
      const existingOrderedItem = await prisma.orderedItems.findUnique({
        where: {
          id,
        },
      });

      console.log('existingOrderedItem: ', existingOrderedItem);

      if (!existingOrderedItem) {
        return res.status(404).json({ error: 'Item Not Found' });
      }

      const costAndProfit = await generateCostAndProfit(id);

      console.log('costAndProfit: ', costAndProfit);

      updatedOrderedItem = await prisma.orderedItems.update({
        where: {
          id,
        },
        data: {
          quantity,
          price,
          cost: costAndProfit.cost,
          profit: price - costAndProfit.cost,
        },
        include: {
          fifo: true,
          inventoryUnit: true,
        },
      });

      if (updatedOrderedItem?.fifo && updatedOrderedItem?.inventoryUnit) {
        await updateSingleInventoryItem(
          orderId,
          updatedOrderedItem.fifo,
          updatedOrderedItem.inventoryUnit,
          quantity,
          existingOrderedItem.quantity,
        );
      }
    }

    // Get admin update info
    const session: any = await getServerSession(req, res, authOptions);
    const adminUpdate: any = session?.user;

    const orderedItems = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
      include: {
        inventoryItem: true,
        fifo: true,
        inventoryUnit: true,
      },
    });

    const orderTotalPrice = generateOrderTotalPrice(orderedItems);
    const updatedAt = getTodayDate();
    const updatedTime = new Date(`${updatedAt.date} ${updatedAt.time}`);

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        discount: orderTotalPrice.discount,
        updatedBy: `Admin - ${adminUpdate.name}`,
        updateTime: updatedTime,
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

    const itemsWithTotalPrice = formatItemsWithTotalPrice(updatedOrder.items);

    return res.status(200).json({
      data: updatedOrderedItem,
      updatedOrder: {
        ...updatedOrder,
        items: itemsWithTotalPrice,
        clientName: updatedOrder?.user?.clientName,
        clientId: updatedOrder?.user?.clientId,
      },
      message: 'Update Data Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
  }
};

export default withAdminAuthGuard(handler);

export const generateCostAndProfit = async (orderedItemId: number) => {
  try {
    const prisma = new PrismaClient();

    const existingItem = await prisma.orderedItems.findUnique({
      where: {
        id: orderedItemId,
      },
      include: {
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

    if (!existingItem) {
      throw new Error(
        'Ordered item id not provided in generate cost and profit',
      );
    }

    let cost = existingItem?.cost;

    const allUnits = await getAllUnitsByInventoryItemId(
      existingItem?.inventoryItemId || -1,
    );
    const itemUnit = allUnits?.find(
      (unit: any) => unit.id === existingItem?.inventoryUnitId,
    );

    if (!cost) {
      cost = existingItem?.fifo?.price
        ? existingItem.fifo.price
        : itemUnit?.unitPrice || 0;
    }

    return { cost: cost || 0, profit: existingItem.price - (cost || 0) };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Fail to generate cost and profit: ', error);
  }
};

export const updateSingleInventoryItem = async (
  orderId: number,
  fifo: Fifo,
  unit: InventoryUnit | any,
  newQuantity: number,
  previousQuantity: number,
  previousUnit: InventoryUnit | any = null,
  // type: 'subtract' | 'restock' | null = null,`
) => {
  try {
    const prisma = new PrismaClient();

    // Handle if expense quantity change or admin just force update the inventory => orderId = -1
    // Only check if orderId is a valid id
    if (orderId > 0) {
      const order: any = await prisma.orders.findUnique({
        where: {
          id: orderId,
        },
      });

      if (!order) {
        console.error('Conflict Order Not Found');
        return;
      }

      const isValidToCheckInventory = await checkOrderValidToAffectInventory(
        order.companyId,
        order.deliveryDate,
      );

      if (!order?.isAffectInventory || !isValidToCheckInventory) {
        console.log('Inventory Avoided');
        return;
      }
    }

    // Subtract the new quantity from inventory quantity, then add back the previous quantity
    const lastUpdatedFifo = await prisma.fifo.findUnique({
      where: {
        id: fifo.id,
      },
      include: {
        inventoryItem: true,
      },
    });

    if (!lastUpdatedFifo) {
      console.error('Comflict FIFO Not Found');
      return;
    }

    const ratio = unit?.ratio || 1;

    const prevFinalQuantity = previousUnit
      ? previousQuantity * previousUnit.ratio
      : previousQuantity * ratio;

    const newFinalQuantity = newQuantity * ratio;

    const updatedQuantity =
      lastUpdatedFifo.quantity - newFinalQuantity + prevFinalQuantity;

    await prisma.fifo.update({
      where: {
        id: fifo.id,
      },
      data: {
        quantity: updatedQuantity,
      },
    });

    // Add action of update inventory item
    if (orderId > 0) {
      const difference = Math.abs(updatedQuantity - lastUpdatedFifo.quantity);

      await recordAction(
        orderId,
        `System updateSingleInventoryItem`,
        updatedQuantity > lastUpdatedFifo.quantity
          ? `Restock ${difference} ${lastUpdatedFifo.inventoryItem.name} to inventory`
          : `Subtract ${difference} ${lastUpdatedFifo.inventoryItem.name} from inventory`,
      );
      // Mark the order hasSubtractInventory to true
      await prisma.orders.update({
        where: {
          id: orderId,
        },
        data: { hasSubtractInventory: true },
      });
    }

    const targetVendorItem = await prisma.vendorItem.findUnique({
      where: {
        id: fifo.vendorItemId,
      },
    });

    if (!targetVendorItem) {
      console.error('Comflict Vendor Item Not Found');
      return;
    }

    await prisma.vendorItem.update({
      where: {
        id: fifo.vendorItemId,
      },
      data: {
        quantity: targetVendorItem?.quantity - fifo.quantity + updatedQuantity,
      },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

export const restockInventoryItem = async (
  orderId: number,
  fifo: Fifo,
  unit: InventoryUnit,
  restockQuantity: number,
) => {
  try {
    await updateSingleInventoryItem(
      orderId,
      fifo,
      unit,
      0,
      restockQuantity,
      null,
      // 'restock',
    );
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

export const subtractInventoryItem = async (
  orderId: number,
  fifo: Fifo,
  unit: InventoryUnit | any,
  subtractedQuantity: number,
) => {
  try {
    // Find the proper fifo to subtract from
    const {
      fifo: properFifo,
      deletedFifoIds,
      newSubtractedQuantity,
    } = await findProperFifoToSubtract(
      fifo.inventoryItemId,
      subtractedQuantity,
    );

    // move all ordered items to the proper fifo
    if (deletedFifoIds.length > 0) {
      await prisma.orderedItems.updateMany({
        where: {
          fifoId: {
            in: deletedFifoIds,
          },
        },
        data: {
          fifoId: properFifo.id,
        },
      });
  
      // delete the old fifos
      await prisma.fifo.deleteMany({
        where: {
          id: {
            in: deletedFifoIds,
          },
        },
      });
    }

    await updateSingleInventoryItem(
      orderId,
      properFifo,
      unit,
      newSubtractedQuantity,
      0,
      null,
      // 'subtract',
    );
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

export const findProperFifoToSubtract = async (
  inventoryItemId: number,
  subtractedQuantity: number, // must be in ratio of 1
) => {
  const allFifos = await prisma.fifo.findMany({
    where: {
      inventoryItemId,
    },
  });

  const sortedFifos = sortByDeliveryDate(allFifos, 'createdAt');

  let newSubtractedQuantity = subtractedQuantity;

  let fifoIndex = 0;
  const deletedFifoIds: number[] = [];

  while (fifoIndex < sortedFifos.length - 1) {
    if (newSubtractedQuantity >= sortedFifos[fifoIndex].quantity) {
      newSubtractedQuantity += sortedFifos[fifoIndex].quantity;
      deletedFifoIds.push(sortedFifos[fifoIndex].id);
      fifoIndex++;
    } else {
      break;
    }
  }

  return {
    fifo: sortedFifos[fifoIndex],
    deletedFifoIds,
    newSubtractedQuantity,
  };
};
