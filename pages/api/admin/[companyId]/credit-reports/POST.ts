import { USER_ROLE } from '@/app/utils/enum';
import { generateOrderTotalPrice } from '@/app/utils/orders';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import { CreditType, InventoryLogFrom, InventoryLogType } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  userId: number;
  orderId: number;
  creditItems: any[];
  type: CreditType;
  reason: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;
    const { userId, orderId, creditItems, type, reason } = req.body as IBody;

    if (!companyId) {
      console.log('Company ID is required');
      return res.status(400).json({ message: 'Company ID is required' });
    }

    if (!orderId) {
      console.log('Order ID is required');
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!creditItems) {
      console.log('Credit items are required');
      return res.status(400).json({ message: 'Credit items are required' });
    }

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    const totalLoss = creditItems.reduce((acc: number, item: any) => {
      return acc + item.priceDifference * item.quantity;
    }, 0);

    const newCreditReport = await prisma.creditReport.create({
      data: {
        companyId: Number(companyId),
        orderId: Number(orderId),
        userId: Number(userId),
        type: type,
        reportedDate: today.dateAndTime,
        reason: reason,
        totalLoss: totalLoss,
        createdAt: today.dateAndTime,
        createdBy: createdBy,
      },
    });

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return res.status(400).json({ message: 'Order not found' });
    }

    const categoryItemIds = creditItems.map(
      (item: any) => item.categoryItem.id,
    );
    const categoryItems = await prisma.item.findMany({
      where: {
        id: {
          in: categoryItemIds,
        },
      },
      include: {
        inventoryItem: true,
        inventoryUnit: true,
      },
    });

    const formattedOrderedItems = formatCreditItemsToOrderedItems(
      Number(companyId),
      creditItems,
      categoryItems,
    );

    // Inject credit items to ordered items
    await createOrderedItems(
      Number(companyId),
      existingOrder,
      formattedOrderedItems,
      createdBy,
    );

    const orderedItems: any = await prisma.orderedItems.findMany({
      where: {
        orderId: orderId,
      },
      include: {
        inventoryItem: true,
        fifo: true,
        inventoryUnit: true,
      },
    });

    if (!orderedItems) {
      return res.status(400).json({ message: 'Order not found' });
    }

    // Record inventory log
    for (const orderedItem of orderedItems) {
      await recordOrderInventoryLog(
        orderId,
        orderedItem.inventoryItemId,
        orderedItem.quantity,
        InventoryLogType.SUBTRACT,
        InventoryLogFrom.EDIT_ORDER,
        `Subtract ${orderedItem.quantity} ${orderedItem.inventoryItem.name} from inventory due to credit report ${newCreditReport.id} created`,
      );
    }

    const formattedCreditItems = formatCreditItems(
      Number(companyId),
      creditItems,
      orderedItems,
      newCreditReport.id,
    );

    // Create credit items
    await prisma.creditItem.createMany({
      data: formattedCreditItems,
    });

    const orderTotalPrice = generateOrderTotalPrice(orderedItems);
    // Update order total price
    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        discount: orderTotalPrice.discount,
      },
    });

    return res.status(200).json({
      message: 'Credit report created successfully',
      data: newCreditReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const formatCreditItemsToOrderedItems = (
  companyId: number,
  creditItems: any[],
  categoryItems: any[],
) => {
  const formattedOrderedItems = categoryItems.map((item: any) => {
    const existCreditItem = creditItems.find(
      (creditItem: any) => creditItem.categoryItem.id === item.id,
    );
    return {
      ...item,
      name: existCreditItem?.name || item.name,
      price: existCreditItem?.price || 0,
      quantity: existCreditItem?.quantity || 1,
      companyId: companyId,
      isCustomAmount: true,
      prevPrice: existCreditItem?.orderedItem?.prevPrice || 0,
      isShowDiscount: true,
    };
  });

  return formattedOrderedItems;
};

export const formatCreditItems = (
  companyId: number,
  creditItems: any[],
  orderedItems: any[],
  creditReportId: number,
) => {
  const formattedCreditItems = creditItems.map((item: any) => {
    const existingOrderedItem = orderedItems.find(
      (orderedItem: any) => orderedItem.name === item.name,
    );
    return {
      companyId: Number(companyId),
      creditReportId: creditReportId,
      inventoryItemId: item.inventoryItem.id,
      actualPrice: item.actualPrice,
      priceDifference: item.priceDifference,
      quantity: item.quantity,
      orderedItemId: existingOrderedItem?.id,
    };
  });

  return formattedCreditItems;
};
