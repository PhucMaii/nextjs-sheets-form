import { Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { ORDER_STATUS } from '@/app/utils/enum';
import { generateListOfDateString, generateMonthRange } from '@/app/utils/time';
import { normalizeDate } from '../utils/date';

interface IQuery {
  startDate?: string;
  endDate?: string;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb', // Set desired value here
    },
  },
};

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

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));

    // formattedEndDate.setDate(formattedEndDate.getDate() - 1);

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
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
        user: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const newOrders = formatReturnOrders(userOrders);
    const totalAmount = userOrders.reduce((acc: number, order: Orders) => {
      return acc + order.totalPrice;
    }, 0);

    // Get debt data
    const monthRange = generateMonthRange();
    const currentMonthListOfDateString = generateListOfDateString(
      monthRange[0],
      monthRange[1],
    );

    console.log(currentMonthListOfDateString, 'currentMonthListOfDateString');

    const incompletedOrders: any = await prisma.orders.findMany({
      where: {
        userId: existingUser.id,
        status: {
          in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
        },
        deliveryDate: {
          notIn: currentMonthListOfDateString,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
        user: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const dueAmount = incompletedOrders.reduce((acc: number, order: Orders) => {
      return acc + order.totalPrice;
    }, 0);

    const dueOrders = formatReturnOrders(incompletedOrders);

    return res.status(200).json({
      data: {
        user: existingUser,
        currentMonthBill: totalAmount,
        dueAmount,
        dueOrders,
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

const formatReturnOrders = (orders: any) => {
  const newOrders = orders.map((order: any) => {
    const items = order.items.map((item: any) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });

    return {
      ...order,
      items,
      ...order.user,
      id: order.id,
    };
  });

  return newOrders;
};
