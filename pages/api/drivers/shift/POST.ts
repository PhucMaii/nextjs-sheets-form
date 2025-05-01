import { PrismaClient, Route } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../../utils/auth';
import {
  convertDeliveryDateStringToDate,
  getTodayDate,
} from '../../utils/date';
import { days } from '@/app/lib/constant';
import { SHIFT_STATUS } from '@/app/utils/enum';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { role } = req.body;

    const driver: any = await getDriverInfo(req, res);

    // Check if driver clocked in
    const today = getTodayDate();

    // const existingShiftSession = await prisma.shiftSession.findFirst({
    //     where: {
    //         driverId: driver.id,
    //         date: today.date,
    //     },
    // });

    // if (existingShiftSession) {
    //     return res.status(400).json({ error: 'You are already clocked in' });
    // }

    const date = convertDeliveryDateStringToDate(today.date);
    const day = days[date.getDay()];

    const targetRoute = driver.routes.find((route: Route) => {
      return route.day === day;
    });

    const shiftSession = await prisma.shiftSession.create({
      data: {
        driverId: driver.id,
        date: today.date,
        startedAt: today.dateAndTime,
        isActive: true,
        routeId: targetRoute?.id,
        status: SHIFT_STATUS.UNPAID,
        role,
      },
    });

    return res
      .status(200)
      .json({ data: shiftSession, message: 'You Clocked In Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
