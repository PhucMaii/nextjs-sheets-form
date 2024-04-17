import { filterDateRangeOrders } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { userId, startDate, endDate } = req.query as RequestQuery;

    const userOrders = await prisma.orders.findMany({
      where: {
        userId: Number(userId),
      },
      include: {
        items: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!startDate || !endDate) {
      return res.status(200).json({
        data: userOrders,
        message: 'Fetch User Orders Successfully',
      });
    }

    const filteredDateRangeOrders = filterDateRangeOrders(
      userOrders,
      startDate,
      endDate,
    );

    return res.status(200).json({
      data: filteredDateRangeOrders,
      message: 'Fetch User Orders In Date Range Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
