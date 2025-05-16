import { ICustomAmount } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateOrderTotalPrice } from '../../orderedItems/PUT';
import { checkAndUpdateUnits } from '../../inventory/expenses/POST';
import { getTodayDate } from '@/pages/api/utils/date';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface IBody {
  orderId: number;
  customAmount: ICustomAmount;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { orderId, customAmount }: IBody = req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { date, time } = getTodayDate();
    const session: any = await getServerSession(req, res, authOptions);
    const user: any = session?.user;
    const createdBy = `Admin - ${user.name}`;
    const dbUnits = await prisma.inventoryUnit.findMany({
      where: {
        vendorItemId: customAmount.inventoryUnit.vendorItemId,
      },
    });

    console.log(customAmount.units, 'units');

    await checkAndUpdateUnits(
      Number(companyId),
      dbUnits,
      customAmount?.units || [],
      customAmount.inventoryUnit.vendorItemId,
      `${date} ${time}`,
      createdBy,
    );

    const targetUnit = await prisma.inventoryUnit.findFirst({
      where: {
        vendorItemId: customAmount.inventoryUnit.vendorItemId,
        ratio: customAmount.inventoryUnit.ratio,
      },
    });

    const orderedItems = await createOrderedItems(
      Number(companyId),
      existingOrder,
      [
        {
          ...customAmount,
          inventoryUnit: targetUnit,
          inventoryUnitId: targetUnit?.id,
        },
      ],
    );

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
