import { USER_ROLE } from '@/app/utils/enum';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    const session: any = await getServerSession(req, res, authOptions);

    const { scheduledShift } = req.body;

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, session?.user?.role);

    // const formattedScheduledShifts = scheduledShifts.map((shift: any) => {
    //   const cost = shift.hours * shift.employee.hourlyRate;
    //   return {
    //     companyId: Number(companyId),
    //     employeeId: Number(shift.employeeId),
    //     startedAt: shift.start,
    //     endedAt: shift.end,
    //     createdAt: today.dateAndTime,
    //     createdBy,
    //     assignedBy: createdBy,
    //     assignedAt: today.dateAndTime,
    //     role: shift.role,
    //     hours: shift.hours,
    //     cost
    //   };
    // });

    const cost = scheduledShift.hours * scheduledShift.employee.hourlyRate;

    await prisma.scheduledShift.create({
      data: {
        companyId: Number(companyId),
        employeeId: Number(scheduledShift.employeeId),
        startedAt: scheduledShift.start,
        endedAt:  scheduledShift.end,
        createdAt: today.dateAndTime,
        createdBy,
        assignedBy: createdBy,
        assignedAt: today.dateAndTime,
        role: scheduledShift.role,
        hours: scheduledShift.hours,
        cost,
      },
    });

    return res
      .status(200)
      .json({ message: 'Scheduled Shifts Created Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error: ' + error });
  }
}
