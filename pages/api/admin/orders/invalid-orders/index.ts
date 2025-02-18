import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  deliveryDate?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { deliveryDate }: IQuery = req.query;

    if (!deliveryDate) {
      return res.status(404).json({ error: 'You are missing selected date' });
    }

    const prisma = new PrismaClient();

    const orders = await prisma.orders.findMany({
      where: {
        deliveryDate,
      },
      include: {
        items: true,
        user: true,
      },
    });

    const invalidOrders = orders.filter((order) => {
      const hasItems = order.items.length > 0;
      const actualSubtotal = order.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      const isSubtotalMatch =
        actualSubtotal.toFixed(2) === order.subTotal?.toFixed(2);

      return !hasItems || !isSubtotalMatch;
    });

    console.log(invalidOrders);

    return res.status(200).json({
      data: invalidOrders,
      message: 'Fetch Invalid Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
