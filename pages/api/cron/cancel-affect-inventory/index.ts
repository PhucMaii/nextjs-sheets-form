import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { ACTION, USER_ROLE } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { recordAction } from '../../utils/timeline';
import prisma from '@/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader, 'AUTH HEADER');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { date, time } = getTodayDate();

    // Check if action has taken yet
    const action = await prisma.action.findFirst({
      where: {
        name: ACTION.CANCEL_AFFECT_INVENTORY,
        date: date,
        companyId: 1,
      },
    });

    if (action && action.name === ACTION.CANCEL_AFFECT_INVENTORY) {
      return res.status(200).json({
        message: 'Action already taken',
      });
    }

    const today = new Date(date);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    const threeDaysAgoString = YYYYMMDDFormat(threeDaysAgo);

    // Set orders on that day no affect inventory
    await prisma.orders.updateMany({
      where: {
        deliveryDate: threeDaysAgoString,
        companyId: 1,
      },
      data: {
        isAffectInventory: false,
      },
    });

    // Record action
    const ordersAffected = await prisma.orders.findMany({
      where: {
        deliveryDate: threeDaysAgoString,
        companyId: 1,
      },
    });

    for (const order of ordersAffected) {
      await recordAction(
        order.id,
        'System',
        `Cancel affect inventory for order ${order.id} automatically`,
      );
    }

    await prisma.action.create({
      data: {
        name: ACTION.CANCEL_AFFECT_INVENTORY,
        date: date,
        description: 'Cancel Affect Inventory For Date: ' + threeDaysAgoString,
        createdAt: time,
        createdBy: USER_ROLE.SYSTEM,
        companyId: 1,
      },
    });

    return res.status(200).json({
      message: 'Disable affect inventory successfully for date: ' + date,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default handler;
