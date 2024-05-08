import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface QueryTypes {
    userId?: string;
    day?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { day }: QueryTypes = req.query;

    const scheduleOrders = await prisma.scheduleOrders.findMany({
      where: {
        day
      },
      include: {
        items: true,
        user: true,
      },
    });

    return res.status(200).json({
      data: scheduleOrders,
      message: 'Fetch Schedule Order Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
