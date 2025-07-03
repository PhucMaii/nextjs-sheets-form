import { IInventoryUnit } from '@/app/utils/type';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { generateOrderTotalPrice } from '../../PUT';
import { formatItemsWithTotalPrice } from '@/pages/api/utils/order';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { checkAndUpdateUnits } from '../../../inventory/expenses/POST';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import prisma from '@/client';

interface IBody {
  id: number;
  orderId: number;
  quantity: number;
  price: number;
  name: string;
  newUnits: IInventoryUnit[];
  inventoryUnit: IInventoryUnit;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }
    const {
      id,
      orderId,
      quantity,
      price,
      name,
      newUnits,
      inventoryUnit,
    }: IBody = req.body;
    console.log(req.body);

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    const existingItem = await prisma.orderedItems.findUnique({
      where: {
        id,
      },
      include: {
        inventoryUnit: true,
        fifo: true,
        inventoryItem: {
          include: {
            fifo: true,
            vendorItem: true,
          },
        },
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        error: 'Item Not Found',
      });
    }

    const customAmount: any = {
      ...existingItem,
      name,
      price,
      quantity,
      units: newUnits,
      inventoryUnit,
      isCustomAmount: true,
    };

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order Not Found',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);
    const adminUpdate: any = session?.user;
    const updatedAt = getTodayDate();
    const dbUnits = await prisma.inventoryUnit.findMany({
      where: {
        vendorItemId: customAmount.inventoryUnit.vendorItemId,
      },
    });

    await checkAndUpdateUnits(
      Number(companyId),
      dbUnits,
      customAmount?.units || [],
      customAmount.inventoryUnit.vendorItemId,
      `${updatedAt.date} ${updatedAt.time}`,
      `Admin - ${adminUpdate?.name}`,
    );

    const targetUnit = await prisma.inventoryUnit.findFirst({
      where: {
        vendorItemId: customAmount.inventoryUnit.vendorItemId,
        ratio: customAmount.inventoryUnit.ratio,
      },
    });

    await createOrderedItems(Number(companyId), existingOrder, [
      {
        ...customAmount,
        inventoryUnit: targetUnit,
        inventoryUnitId: targetUnit?.id,
      },
    ]);

    // Delete prev ordered item
    await prisma.orderedItems.delete({
      where: {
        id: existingItem.id,
      },
    });

    const newlyAddedItem = await prisma.orderedItems.findFirst({
      where: {
        orderId: existingOrder.id,
        name,
        price,
        quantity,
        inventoryItemId: existingItem.inventoryItemId,
        isCustomAmount: true,
      },
    });

    // Apply that id on new item
    const updatedOrderedItem = await prisma.orderedItems.update({
      where: {
        id: newlyAddedItem?.id,
      },
      data: {
        id: existingItem.id,
      },
    });

    // Update order total price
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
        updatedBy: `Admin - ${adminUpdate?.name}`,
        updateTime: updatedTime,
      },
      include: {
        items: true,
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
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
