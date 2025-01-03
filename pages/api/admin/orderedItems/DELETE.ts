import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

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
    });

    if (!existingItem) {
      return res.status(404).json({
        error: 'Ordered Item Not Found',
      });
    }

    await prisma.orderedItems.delete({
      where: {
        id: existingItem.id,
      },
    });

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: existingItem.orderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order Not Found',
      });
    }

    const totalAmount = existingOrder.items.reduce((acc: number, item: any) => {
      return acc + item.amount;
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
