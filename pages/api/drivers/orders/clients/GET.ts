import { generateListOfDateString } from '@/app/utils/time';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { normalizeDate } from '@/pages/api/utils/date';
import { formatItemsWithTotalPrice } from '@/pages/api/utils/order';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId, startDate, endDate } = req.query as IQuery;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start Date and End Date are required',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);

    const driver = session?.user;

    // Generate list of day string
    const normalizedStartDate = normalizeDate(new Date(startDate));
    const normalizedEndDate = normalizeDate(new Date(endDate));
    const listOfDateString = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    const userOrders = await prisma.orders.findMany({
      where: {
        userId: Number(userId),
        deliveryDate: {
          in: listOfDateString,
        },
        companyId: driver?.companyId,
      },
      include: {
        items: true,
        user: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const formatUserOrders = userOrders.map((order: any) => {
      const formatItems = formatItemsWithTotalPrice(order.items);

      // ...user for printing, regular user for displaying in table
      const { user, ...restOfData } = order;
      return { ...user, ...restOfData, user, items: formatItems };
    });

    return res.status(200).json({
      data: formatUserOrders,
      message: 'Fetch User Orders In Date Range Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
