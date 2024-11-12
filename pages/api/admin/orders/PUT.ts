import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import { restockInventoryItem, subtractInventoryItem } from '../orderedItems/single';

interface BodyPropTypes {
  orderId: number;
  deliveryDate: string;
  status?: ORDER_STATUS;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { orderId, deliveryDate, status } = req.body as BodyPropTypes;

    const updateData: { deliveryDate: string; status?: ORDER_STATUS } = {
      deliveryDate,
    };

    if (status) {
      updateData.status = status;
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      }
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'No Order Found'
      });
    }

    // Get person update info
    const adminUpdate: any = await getUserInfo(req, res);

    const updateTime = new Date();
    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        ...updateData,
        updatedBy: `Admin - ${adminUpdate.clientName}`,
        updateTime,
        isVoid: false,
      },
      include: {
        items: true,
      }
    });

    // Update Inventory Item
    // From other status to VOID -> Inventory Item get restock
    if (existingOrder.status !== ORDER_STATUS.VOID && updatedOrder.status === ORDER_STATUS.VOID) {
      for (const item of updatedOrder.items) {
        if (item?.inventoryItemId) {
          // await updateSingleInventoryItem(item.inventoryItemId, 0, item.quantity);
          await restockInventoryItem(item.inventoryItemId, item.quantity);
        }
      }
    }

    // From VOID to other status -> Inventory Item Stock Is Subtracted
    if (existingOrder.status === ORDER_STATUS.VOID && updatedOrder.status !== ORDER_STATUS.VOID) {
      for (const item of updatedOrder.items) {
        if (item?.inventoryItemId) {
          // await updateSingleInventoryItem(item.inventoryItemId, item.quantity, 0);
          await subtractInventoryItem(item.inventoryItemId, item.quantity);
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
