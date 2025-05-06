import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateHours } from '../../drivers/shift/clock-out';
import { SHIFT_STATUS, WORKING_ROLE } from '@/app/utils/enum';

const prisma = new PrismaClient();

interface IBody {
  employeeId: number;
  date: string;
  startedAt: string;
  endedAt: string;
  routeId: number;
  role: WORKING_ROLE;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { employeeId, date, startedAt, endedAt, routeId, role }: IBody =
      req.body;

    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const hours = calculateHours(startedAt, endedAt);

    // const startDateString = formatDateString(new Date(startedAt));
    // const endDateString = formatDateString(new Date(endedAt));

    console.log({
      startedAt,
      endedAt,
      hours,
    });

    const newShift = await prisma.shiftSession.create({
      data: {
        employeeId, // error becaus have not change in the schema
        date,
        startedAt,
        endedAt,
        routeId,
        hours,
        cost: hours * (existingEmployee?.hourlyRate || 1),
        status: SHIFT_STATUS.UNPAID,
        role,
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
