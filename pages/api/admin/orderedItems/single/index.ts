import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../../utils/withAdminAuthGuard';
import { Fifo, InventoryUnit, PrismaClient } from '@prisma/client';
import { generateOrderTotalPrice } from '../PUT';
import { getUserInfo } from '@/pages/api/utils/auth';
import {
  checkOrderValidToAffectInventory,
  formatItemsWithTotalPrice,
} from '@/pages/api/utils/order';
import { getTodayDate } from '@/pages/api/utils/date';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();
    const { id, orderId, quantity, price } = req.body as any;

    const existingOrderedItem = await prisma.orderedItems.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrderedItem) {
      return res.status(404).json({ error: 'Item Not Found' });
    }

    // Get admin update info
    const adminUpdate: any = await getUserInfo(req, res);

    const updatedOrderedItem = await prisma.orderedItems.update({
      where: {
        id,
      },
      data: {
        quantity,
        price,
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
    // const updatedOrder = await updateOrderTotalPrice(
    //   orderId,
    //   orderTotalPrice,
    //   `Admin - ${adminUpdate.clientName}`,
    // );
    const orderTotalPrice = generateOrderTotalPrice(orderedItems);
    const updatedAt = getTodayDate();
    const updatedTime = new Date(`${updatedAt.date} ${updatedAt.time}`)

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
        updatedBy: `Admin - ${adminUpdate.clientName}`,
        updateTime: updatedTime,
      },
      include: {
        items: true,
        user: true,
      },
    });

    // const itemsWithTotalPrice = updatedOrder.items.map((item) => {
    //   return {
    //     ...item,
    //     totalPrice: item.quantity * item.price,
    //   };
    // });

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

export const updateSingleInventoryItem = async (
  orderId: number,
  fifo: Fifo,
  unit: InventoryUnit | any,
  newQuantity: number,
  previousQuantity: number,
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
    });

    if (!lastUpdatedFifo) {
      console.error('Comflict FIFO Not Found');
      return;
    }

    const ratio = unit?.ratio || 1;
    const updatedQuantity =
      lastUpdatedFifo.quantity - newQuantity * ratio + previousQuantity * ratio;
    await prisma.fifo.update({
      where: {
        id: fifo.id,
      },
      data: {
        quantity: updatedQuantity,
      },
    });

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
    await updateSingleInventoryItem(orderId, fifo, unit, 0, restockQuantity);
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
    await updateSingleInventoryItem(orderId, fifo, unit, subtractedQuantity, 0);
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};
