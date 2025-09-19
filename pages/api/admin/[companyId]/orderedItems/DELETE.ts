import { InventoryLogFrom, InventoryLogType, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { restockInventoryItem } from './single';
import { generateOrderTotalPrice } from './PUT';
import { checkOrderValidToAffectInventory } from '@/pages/api/utils/order';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Ordered Item Id Not Provided',
      });
    }

    const existingItem: any = await prisma.orderedItems.findUnique({
      where: {
        id: Number(id),
        orderId: {
          not: null,
        },
      },
      include: {
        fifo: true,
        inventoryUnit: true,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        error: 'Ordered Item Not Found',
      });
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: existingItem.orderId,
      },
      include: {
        items: {
          where: {
            id: {
              not: Number(id),
            },
            quantity: {
              gt: 0,
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order Not Found',
      });
    }

    if (existingOrder.items.length === 0) {
      return res.status(400).json({
        error: 'Order Cannot Be Empty',
      });
    }

    const isValidToAffectInventory = await checkOrderValidToAffectInventory(
      existingOrder?.companyId || 1,
      existingOrder.deliveryDate,
    );

    if (existingItem.fifo && existingItem.inventoryUnit && isValidToAffectInventory) {
      await restockInventoryItem(
        existingItem.orderId,
        existingItem.fifo,
        existingItem.inventoryUnit,
        existingItem.quantity,
      );

      // Record inventory log
      await recordOrderInventoryLog(
        existingItem.orderId,
        existingItem.fifo.inventoryItemId,
        existingItem.quantity,
        InventoryLogType.RESTOCK,
        InventoryLogFrom.EDIT_ORDER,
        `Restock ${existingItem.quantity} ${existingItem?.inventoryItem?.name} to inventory due to order ${existingOrder.id} removed item ${existingItem.name}`,
      );
    }

    await prisma.orderedItems.delete({
      where: {
        id: existingItem.id,
      },
    });

    // const totalAmount = existingOrder.items.reduce((acc: number, item: any) => {
    //   if (item.id === existingItem.id) {
    //     return acc; // Skip the deleted item
    //   }
    //   return acc + item.price * item.quantity;
    // }, 0);
    const total = generateOrderTotalPrice(existingOrder.items);

    await prisma.orders.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        totalPrice: total.totalPrice,
        subTotal: total.subTotal,
        discount: total.discount,
        PST: total.PST,
        GST: total.GST,
      },
    });

    return res.status(200).json({
      message: 'Ordered Item Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
