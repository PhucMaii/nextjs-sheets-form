import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { PaymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const {
      hours,
      total,
      startDate,
      endDate,
      yyyymmddStartDate,
      yyyymmddEndDate,
      employeeId,
    } = req.body;

    if (
      !hours ||
      !total ||
      !startDate ||
      !endDate ||
      !yyyymmddStartDate ||
      !yyyymmddEndDate ||
      !employeeId
    ) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    const today = getTodayDate();

    const newPayroll = {
      hours: Number(hours),
      total: Number(total),
      startDate: yyyymmddStartDate,
      endDate: yyyymmddEndDate,
      employeeId,
      createdAt: today.dateAndTime,
      createdBy,
      companyId: Number(companyId),
      status: PaymentStatus.Unpaid,
    };

    const payroll = await prisma.payroll.create({
      data: newPayroll,
    });

    return res
      .status(200)
      .json({ data: payroll, message: 'Payroll created successfully' });
  } catch (error: any) {
    console.log('There was an error: ', error);
    return res.status(500).json({ error: 'There was an error' });
  }
}
