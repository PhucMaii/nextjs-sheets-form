import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import {
  restockInventoryItem,
  subtractInventoryItem,
} from '../orderedItems/single';

interface BodyPropTypes {
  orderId: number;
  deliveryDate?: string;
  status?: ORDER_STATUS;
  note?: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { orderId, deliveryDate, status, note } = req.body as BodyPropTypes;

    const updateData: any = {};
    if (deliveryDate) {
      updateData.deliveryDate = deliveryDate;
    }

    if (status) {
      updateData.status = status;
    }

    if (note) {
      updateData.note = note;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No Data To Update',
      });
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'No Order Found',
      });
    }

    // Get person update info
    const session: any = await getServerSession(req, res, authOptions);
    const adminUpdate: any = session?.user;

    const updateTime = new Date();
    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        ...updateData,
        updatedBy: `Admin - ${adminUpdate.name}`,
        updateTime,
        isVoid: false,
      },
      include: {
        items: {
          include: {
            fifo: true,
            inventoryUnit: true,
          },
        },
      },
    });

    // Update Inventory Item
    // From other status to VOID -> Inventory Item get restock
    if (
      existingOrder.status !== ORDER_STATUS.VOID &&
      updatedOrder.status === ORDER_STATUS.VOID
    ) {
      for (const item of updatedOrder.items) {
        if (item?.fifo && item?.inventoryUnit) {
          await restockInventoryItem(
            orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
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
          await subtractInventoryItem(
            orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
        }
      }
    }

    return res.status(200).json({
      data: updatedOrder,
      message: 'Order Updated Successfully',
    });
  } catch (error: any) {
    console.log('Fail to get order: ', error);
    return res.status(500).json({
      error: 'Fail to get orders: ' + error,
    });
  }
}
