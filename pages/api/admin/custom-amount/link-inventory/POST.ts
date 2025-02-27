import { ICustomAmount } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { createOrderedItems } from '../../orders/POST';
import { generateOrderTotalPrice } from '../../orderedItems/PUT';
import { checkAndUpdateUnits } from '../../inventory/expenses/POST';
import { getTodayDate } from '@/pages/api/utils/date';
import { getUserInfo } from '@/pages/api/utils/auth';

interface IBody {
  orderId: number;
  customAmount: ICustomAmount;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { orderId, customAmount }: IBody = req.body;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { date, time } = getTodayDate();
    const createdBy = await getUserInfo(req, res);
    const dbUnits = await prisma.inventoryUnit.findMany({
      where: {
        vendorItemId: customAmount.inventoryUnit.vendorItemId,
      },
    });

    console.log(customAmount.units, 'units');

    await checkAndUpdateUnits(
      dbUnits,
      customAmount?.units || [],
      customAmount.inventoryUnit.vendorItemId,
      `${date} ${time}`,
      `Admin - ${createdBy?.clientName}`,
    );

    const targetUnit = await prisma.inventoryUnit.findFirst({
      where: {
        vendorItemId: customAmount.inventoryUnit.vendorItemId,
        ratio: customAmount.inventoryUnit.ratio,
      },
    });

    console.log(targetUnit, 'targetUnit');

    const orderedItems = await createOrderedItems(existingOrder, [
      {
        ...customAmount,
        inventoryUnit: targetUnit,
        inventoryUnitId: targetUnit?.id,
      },
    ]);

    // Generate total price order newly added custom amount order
    const newlyAddedCustomAmountOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!newlyAddedCustomAmountOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderTotal = generateOrderTotalPrice(
      newlyAddedCustomAmountOrder.items,
    );

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: orderTotal.totalPrice,
        subTotal: orderTotal.subTotal,
        PST: orderTotal.PST,
        GST: orderTotal.GST,
        discount: orderTotal.discount,
      },
    });

    const targetItem = orderedItems[0];

    const addedItem = await prisma.orderedItems.findFirst({
      where: {
        orderId: targetItem.orderId,
        name: targetItem.name,
        price: targetItem.price,
        quantity: targetItem.quantity,
        inventoryItemId: targetItem.inventoryItemId,
        inventoryUnitId: targetItem.inventoryUnitId,
      },
      include: {
        fifo: true,
        inventoryUnit: true,
      },
    });

    if (!addedItem) {
      return res.status(404).json({ error: 'Conflict add item not found' });
    }

    return res.status(200).json({
      data: {
        ...addedItem,
        totalPrice: addedItem.price * addedItem.quantity,
      },
      message: 'Add Custom Amount Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
