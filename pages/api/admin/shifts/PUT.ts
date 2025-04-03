import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateHours } from '../../drivers/shift/clock-out';

const prisma = new PrismaClient();

interface IBody {
  id: number;
  startedAt: string;
  endedAt: string;
  routeId: number;
  driverId: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, startedAt, endedAt, routeId, driverId }: IBody = req.body;

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

    if (
      startedAt !== existingShift.startedAt ||
      endedAt !== existingShift.endedAt
    ) {
      updatedFields.startedAt = startedAt;
      updatedFields.endedAt = endedAt;

      const hours = calculateHours(startedAt, endedAt);
      updatedFields.hours = hours;
    }

    if (routeId !== existingShift.routeId) {
      updatedFields.routeId = routeId;
    }

    if (driverId !== existingShift.driverId) {
      updatedFields.driverId = driverId;
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

      const cost = (driver?.hourlyRate || 1) * updatedFields.hours;
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
