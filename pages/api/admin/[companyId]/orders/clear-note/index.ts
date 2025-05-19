import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { orderId } = req.body as { orderId: number };

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        note: '',
      },
    });

    return res.status(200).json({ message: 'Note cleared successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
