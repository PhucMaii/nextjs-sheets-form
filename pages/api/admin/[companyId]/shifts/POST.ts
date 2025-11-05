import { PayrollType, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { SHIFT_STATUS, WORKING_ROLE } from '@/app/utils/enum';
import { calculateHours } from '@/pages/api/drivers/shift/clock-out';

const prisma = new PrismaClient();

interface IBody {
  driverId: number;
  date: string;
  startedAt: string;
  endedAt: string;
  routeId: number;
  role: WORKING_ROLE;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { driverId, date, startedAt, endedAt, routeId, role }: IBody =
      req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }

     const existingDriver = await prisma.employee.findUnique({
      where: {
        id: driverId,
      },
    });

    if (!existingDriver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const hours = calculateHours(startedAt, endedAt);

    // const startDateString = formatDateString(new Date(startedAt));
    // const endDateString = formatDateString(new Date(endedAt));

    console.log({
      startedAt,
      endedAt,
      hours,
    });

    const cost =
      existingDriver.payrollType === PayrollType.hourly
        ? hours * (existingDriver?.payRate || 1)
        : 0;
    const newShift = await prisma.shiftSession.create({
      data: {
        driverId,
        employeeId: driverId,
        date,
        startedAt,
        endedAt,
        routeId,
        hours,
        cost: cost,
        status: SHIFT_STATUS.UNPAID,
        role,
        companyId: Number(companyId),
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
