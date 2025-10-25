import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { restockInventoryItem } from '../orderedItems/single';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';
import { checkOrderValidToAffectInventory } from '@/pages/api/utils/order';
import { InventoryLogFrom, InventoryLogType } from '@prisma/client';
import { generateOrderTotalPrice } from '../orderedItems/PUT';

interface IQuery {
  companyId?: string;
  id?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { companyId, id }: IQuery = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const existingCreditReport = await prisma.creditReport.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        creditItems: {
          include: {
            inventoryItem: true,
            orderedItem: {
              include: {
                fifo: true,
                inventoryUnit: true,
              },
            },
          },
        },
        order: true,
      },
    });

    if (!existingCreditReport) {
      return res.status(404).json({ error: 'Credit report not found' });
    }

    const isValidToAffectInventory = await checkOrderValidToAffectInventory(
      Number(companyId),
      existingCreditReport.order.deliveryDate,
    );

    // Delete and restock credit items
    if (existingCreditReport.creditItems.length > 0) {
      for (const item of existingCreditReport.creditItems) {
        if (
          item.orderedItem.fifo &&
          item.orderedItem.inventoryUnit &&
          isValidToAffectInventory
        ) {
          await restockInventoryItem(
            existingCreditReport.orderId,
            item.orderedItem.fifo,
            item.orderedItem.inventoryUnit,
            item.quantity,
          );

          await recordOrderInventoryLog(
            existingCreditReport.orderId,
            item.orderedItem.fifo.inventoryItemId,
            item.quantity,
            InventoryLogType.RESTOCK,
            InventoryLogFrom.EDIT_ORDER,
            `Restock ${item.quantity} ${item.inventoryItem.name} to inventory due to credit report ${existingCreditReport.id} deleted`,
          );
        }

        await prisma.orderedItems.delete({  
          where: {
            id: item.orderedItemId,
          },
        });
      }
    }

    // Check if order has any items left
    const orderItems = await prisma.orderedItems.findMany({
      where: {
        orderId: existingCreditReport.orderId,
      },
      include: {
        inventoryItem: true,
      },
    });

    if (orderItems.length === 0) {
      await prisma.orders.delete({
        where: {
          id: existingCreditReport.orderId,
        },
      });
    } else {
        const totalPrice: any = generateOrderTotalPrice(orderItems);
        await prisma.orders.update({
          where: {
            id: existingCreditReport.orderId,
          },
          data: {
            totalPrice: totalPrice.totalPrice,
            subTotal: totalPrice.subTotal,
            PST: totalPrice.PST,
            GST: totalPrice.GST,
            discount: totalPrice.discount,
          },
        });
    }

    await prisma.creditReport.delete({
      where: {
        id: Number(id),
      },
    });

    return res
      .status(200)
      .json({ message: 'Credit report deleted successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
