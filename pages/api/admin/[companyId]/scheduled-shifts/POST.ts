import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { PayrollType } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '@/client';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    const session: any = await getServerSession(req, res, authOptions);

    const { scheduledShift } = req.body;

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, session?.user?.role);

    const cost = scheduledShift.employee.payrollType === PayrollType.hourly ? scheduledShift.hours * scheduledShift.employee.payRate : 0;

    const newShift = await prisma.scheduledShift.create({
      data: {
        companyId: Number(companyId),
        employeeId: Number(scheduledShift.employeeId),
        startedAt: scheduledShift.startedAt,
        date: scheduledShift.date,
        queryDate: scheduledShift.queryDate,
        endedAt:  scheduledShift.endedAt,
        createdAt: today.dateAndTime,
        createdBy,
        assignedBy: createdBy,
        assignedAt: today.dateAndTime,
        role: scheduledShift.role,
        hours: Math.round(scheduledShift.hours * 100) / 100,
        cost,
      },
    });

    return res
      .status(200)
      .json({ message: 'Scheduled Shifts Created Successfully', data: newShift });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error: ' + error });
  }
}
