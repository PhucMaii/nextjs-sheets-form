import { days } from '@/app/lib/constant';
import { getDriverInfo } from '@/pages/api/utils/auth';
import {
  convertDeliveryDateStringToDate,
  getTodayDate,
} from '@/pages/api/utils/date';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const driver: any = await getDriverInfo(req, res);

    const today = getTodayDate();

    const date = convertDeliveryDateStringToDate(today.date);
    const day = days[date.getDay()];
    // Check if driver has route today
    const route = await prisma.route.findFirst({
      where: {
        driverId: driver.id,
        day,
      },
    });

    const shiftSession = await prisma.shiftSession.findMany({
      where: {
        driverId: driver.id,
        date: today.date,
      },
    });

    if (!route) {
      return res.status(200).json({
        data: shiftSession,
        isWorkingDay: false,
        message: 'No route found for today',
      });
    }

    return res.status(200).json({
      data: shiftSession,
      isWorkingDay: true,
      message: 'Fetch Shift Session Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withDriverAuthGuard(handler);
