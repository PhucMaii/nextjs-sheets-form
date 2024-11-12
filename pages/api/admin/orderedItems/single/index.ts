import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../../utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { updateOrderTotalPrice } from '../PUT';
import { getUserInfo } from '@/pages/api/utils/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();
    const { id, orderId, quantity, price, orderTotalPrice } = req.body as any;

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
    });

    if (updatedOrderedItem?.inventoryItemId) {
      await updateSingleInventoryItem(updatedOrderedItem.inventoryItemId, quantity, existingOrderedItem.quantity)
    }

    const updatedOrder = await updateOrderTotalPrice(
      orderId,
      orderTotalPrice,
      `Admin - ${adminUpdate.clientName}`,
    );

    return res.status(200).json({
      data: updatedOrderedItem,
      updatedOrder,
      message: 'Update Data Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
  }
};

export default withAdminAuthGuard(handler);

export const updateSingleInventoryItem = async (inventoryItemId: number, newQuantity: number, previousQuantity: number) => {
  try {
    const prisma = new PrismaClient();

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: inventoryItemId,
      },
    });

    if (inventoryItem) {
      // Subtract the new quantity from inventory quantity, then add back the previous quantity
      const updatedQuantity = inventoryItem.quantity - newQuantity + previousQuantity;
      await prisma.inventoryItem.update({
        where: {
          id: inventoryItemId,
        },
        data: {
          quantity: updatedQuantity,
        },
      });
    }
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
}