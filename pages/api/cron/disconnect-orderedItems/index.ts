import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { ACTION, TYPE, USER_ROLE } from '@/app/utils/enum';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization;

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const prisma = new PrismaClient();
    const { date, time } = getTodayDate();

    // Check if action has taken yet
    const action = await prisma.action.findFirst({
      where: {
        name: ACTION.DISCONNECT_ORDERED_ITEMS,
        date: date,
        companyId: 1,
      },
    });

    if (action && action.name === ACTION.DISCONNECT_ORDERED_ITEMS) {
      return res.status(200).json({
        message: 'Action already taken',
      });
    }

    const today = new Date(date);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(today.getDate() - 90);

    const threeMonthsAgoString = YYYYMMDDFormat(threeMonthsAgo);

    // Set unit, fifo and inventory item to null
    await prisma.orderedItems.updateMany({
      where: {
        Orders: {
          deliveryDate: threeMonthsAgoString,
        },
        companyId: 1,
      },
      data: {
        inventoryItemId: null,
        inventoryUnitId: null,
        fifoId: null,
      },
    });

    // Set all orders on that date to fixed
    await prisma.orders.updateMany({
      where: {
        deliveryDate: threeMonthsAgoString,
        companyId: 1,
      },
      data: {
        type: TYPE.LOCKED,
      },
    });

    // Push action
    await prisma.action.create({
      data: {
        name: ACTION.DISCONNECT_ORDERED_ITEMS,
        date: date,
        description: 'Disconnect Ordered Items For ' + threeMonthsAgoString,
        createdAt: `${date} ${time}`,
        createdBy: USER_ROLE.SYSTEM,
        companyId: 1,
      },
    });

    return res.status(200).json({
      message:
        'Disconnect Ordered Items Successfully For ' + threeMonthsAgoString,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default handler;
