import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      id,
      hours,
      total,
      yyyymmddStartDate,
      yyyymmddEndDate,
      employeeId,
    } = req.body;

    if (
      !id ||
      !hours ||
      !total ||
      !yyyymmddStartDate ||
      !yyyymmddEndDate ||
      !employeeId
    ) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const existingPayroll = await prisma.payroll.findUnique({
      where: { id },
    });

    if (!existingPayroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        hours,
        total,
        startDate: yyyymmddStartDate,
        endDate: yyyymmddEndDate,
        employeeId: employeeId,
      },
    });

    res
      .status(200)
      .json({ data: payroll, message: 'Payroll updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
