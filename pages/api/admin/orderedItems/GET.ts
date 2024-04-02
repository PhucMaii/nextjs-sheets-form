import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  orderId?: number;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { orderId } = req.query as RequestQuery;

    const items = await prisma.orderedItems.findMany({
      where: {
        orderId,
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
