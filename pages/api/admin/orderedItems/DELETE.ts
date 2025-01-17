import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { restockInventoryItem } from './single';

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
      }
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

    if (existingItem.fifo && existingItem.inventoryUnit) {
      await restockInventoryItem(
        existingItem.orderId,
        existingItem.fifo,
        existingItem.inventoryUnit,
        existingItem.quantity,
      )
    }

    await prisma.orderedItems.delete({
      where: {
        id: existingItem.id,
      },
    });

    const totalAmount = existingOrder.items.reduce((acc: number, item: any) => {
      if (item.id === existingItem.id) {
        return acc; // Skip the deleted item
      }
      return acc + item.price * item.quantity;
    }, 0);

    await prisma.orders.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        totalPrice: totalAmount,
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
