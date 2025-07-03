import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface RequestQuery {
  orderId?: number;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { orderId } = req.query as RequestQuery;

    const items = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
      include: {
        inventoryItem: true,
        inventoryUnit: true,
        fifo: true,
      },
    });

    return res.status(200).json({
      data: items,
      message: 'Fetch Data Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
}
