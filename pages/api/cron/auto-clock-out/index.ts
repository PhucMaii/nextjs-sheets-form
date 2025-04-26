import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import { calculateHours } from '../../drivers/shift/clock-out';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activeShifts = await prisma.shiftSession.findMany({
      where: {
        endedAt: null,
      },
    });

    // End shifts
    const today = getTodayDate();

    for (const shift of activeShifts) {
      const hours = calculateHours(shift.startedAt, today.dateAndTime);
      await prisma.shiftSession.update({
        where: {
          id: shift.id,
        },
        data: {
          endedAt: today.dateAndTime,
          hours,
          isActive: false,
        },
      });
    }

    return res.status(200).json({
      message: 'Clock out all drivers successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
