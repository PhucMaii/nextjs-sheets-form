import { ORDER_STATUS } from '@/app/utils/enum';
import {
  restockInventoryItem,
  subtractInventoryItem,
} from '@/pages/api/admin/orderedItems/single';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orderId: number;
  updatedStatus: ORDER_STATUS;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { orderId, updatedStatus }: IBody = req.body;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order Id Not Found',
      });
    }

    // Get driver update info
    const driverUpdate: any = await getDriverInfo(req, res);
    const updateTime = new Date();

    const updatedOrder = await prisma.orders.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        status: updatedStatus,
        updatedBy: `Driver - ${driverUpdate.name}`,
        updateTime,
        isVoid: updatedStatus === ORDER_STATUS.VOID && true,
      },
      include: {
        user: {
          include: {
            preference: true,
            category: true,
          },
        },
        items: {
          include: {
            fifo: true,
            inventoryUnit: true,
          }
        },
      },
    });

    // Inventory Item Update
    // From other status to VOID -> Inventory Item get restock
    if (
      existingOrder.status !== ORDER_STATUS.VOID &&
      updatedOrder.status === ORDER_STATUS.VOID
    ) {
      for (const item of updatedOrder.items) {
        if (item?.fifo && item?.inventoryUnit) {
          await restockInventoryItem(item.fifo, item.inventoryUnit, item.quantity);
        }
      }
    }

    // From VOID to other status -> Inventory Item Stock Is Subtracted
    if (
      existingOrder.status === ORDER_STATUS.VOID &&
      updatedOrder.status !== ORDER_STATUS.VOID
    ) {
      for (const item of updatedOrder.items) {
        if (item?.fifo && item?.inventoryUnit) {
          await subtractInventoryItem(item.fifo, item.inventoryUnit, item.quantity);
        }
      }
    }

    const newItems = updatedOrder.items.map((item: OrderedItems) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });

    return res.status(200).json({
      data: { ...updatedOrder.user, ...updatedOrder, items: newItems },
      message: 'Order Status Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
