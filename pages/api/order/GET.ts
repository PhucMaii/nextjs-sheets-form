import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { ORDER_STATUS } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';

interface IQuery {
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { startDate, endDate }: IQuery = req.query;

    if (!startDate || !endDate) {
      return res.status(404).json({ error: 'Missing required parameters' });
    }

    const session: any = await getServerSession(req, res, authOptions);

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session?.user?.id),
      },
      include: {
        category: true,
      },
    });

    if (!existingUser) {
      return res.status(401).json({ error: 'User Not Found' });
    }

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);

    formattedEndDate.setDate(formattedEndDate.getDate() + 1);

    const dateList = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const userOrders: any = await prisma.orders.findMany({
      where: {
        userId: existingUser.id,
        status: {
          in: [
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.INCOMPLETED,
            ORDER_STATUS.DELIVERED,
          ],
        },
        deliveryDate: {
          in: dateList,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const newOrders = userOrders.map((order: any) => {
      const items = order.items.map((item: any) => {
        const totalPrice = item.quantity * item.price;
        return { ...item, totalPrice };
      });

      return {
        ...order,
        items,
        ...existingUser,
        category: existingUser.category,
        id: order.id,
      };
    });

    return res.status(200).json({
      data: {
        user: existingUser,
        userOrders: newOrders,
      },
      message: 'Fetch User Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
