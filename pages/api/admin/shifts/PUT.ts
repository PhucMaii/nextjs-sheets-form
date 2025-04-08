import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateHours } from '../../drivers/shift/clock-out';
import { formatDateString } from '../../utils/date';
import { WORKING_ROLE } from '@/app/utils/enum';

const prisma = new PrismaClient();

interface IBody {
  id: number;
  date: string;
  startedAt: string;
  endedAt: string;
  routeId: number;
  driverId: number;
  role: WORKING_ROLE;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, date, startedAt, endedAt, routeId, driverId, role }: IBody = req.body;

    console.log(date, 'date')
    const existingShift = await prisma.shiftSession.findUnique({
      where: { id },
      include: {
        route: true,
        driver: true,
      },
    });

    if (!existingShift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const updatedFields: any = {};

    const startDateString = formatDateString(startedAt);
    const endDateString = formatDateString(endedAt);
    if (
      startDateString !== existingShift.startedAt ||
      endDateString !== existingShift.endedAt
    ) {
      updatedFields.startedAt = startDateString;
      updatedFields.endedAt = endDateString;

      const hours = calculateHours(startedAt, endedAt);
      updatedFields.hours = hours;
    }

    if (routeId !== existingShift.routeId) {
      if (routeId === -1) {
        updatedFields.routeId = null;
      } else {
        updatedFields.routeId = routeId;
      }
    }

    if (driverId !== existingShift.driverId) {
      updatedFields.driverId = driverId;
    }

    if (date !== existingShift.date) {
      updatedFields.date = date;
    }

    if (role !== existingShift.role) {
      updatedFields.role = role;
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(200).json({ message: 'Update Shift Successfully' });
    }

    // Handle update cost if anything hours or driverId changed
    if (updatedFields.hours || updatedFields.driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: updatedFields.driverId || existingShift.driverId },
        include: {
          routes: true,
        },
      });

      if (!driver) {
        return res.status(404).json({ error: 'Conflict Driver not found' });
      }

      const cost = (driver?.hourlyRate || 1) * (updatedFields?.hours || existingShift.hours);
      updatedFields.cost = cost;
    }

    const updatedShift = await prisma.shiftSession.update({
      where: { id },
      data: updatedFields,
    });

    return res.status(200).json({
      message: 'Update Shift Successfully',
      data: updatedShift,
    });
  } catch (error: any) {
    console.log('Error in PUT /api/admin/shifts:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
