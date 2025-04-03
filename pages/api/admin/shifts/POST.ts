import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateHours } from '../../drivers/shift/clock-out';
import { formatDateString } from '../../utils/date';

const prisma = new PrismaClient();

interface IBody {
  driverId: number;
  date: string;
  startedAt: string;
  endedAt: string;
  routeId: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { driverId, date, startedAt, endedAt, routeId }: IBody = req.body;

    const existingDriver = await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
    });

    if (!existingDriver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const hours = calculateHours(startedAt, endedAt);

    const startDateString = formatDateString(startedAt);
    const endDateString = formatDateString(endedAt);

    const newShift = await prisma.shiftSession.create({
      data: {
        driverId,
        date,
        startedAt: startDateString,
        endedAt: endDateString,
        routeId,
        hours,
        cost: hours * (existingDriver?.hourlyRate || 1),
      },
    });

    return res
      .status(200)
      .json({ data: newShift, message: 'Shift created successfully' });
  } catch (error: any) {
    console.error('Error in POST /api/admin/shifts:', error);
    res.status(500).json({ error: 'Internal Server Error' + error });
  }
}
