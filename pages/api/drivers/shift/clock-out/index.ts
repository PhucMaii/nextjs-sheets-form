import { getDriverInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { PayrollType } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { shiftId } = req.body;

    const driver: any = await getDriverInfo(req, res);

    const today = getTodayDate();

    const shiftSession = await prisma.shiftSession.findUnique({
      where: {
        id: shiftId,
        // driverId: driver.id,
        employeeId: driver.id,
        date: today.date}});

    if (!shiftSession) {
      return res.status(400).json({ error: 'You are not clocked in' });
    }

    const hours = calculateHours(shiftSession.startedAt, today.dateAndTime);

    const cost =
      driver.payrollType === PayrollType.hourly
        ? hours * (driver?.payRate || 1)
        : 0;

    const updatedShiftSession = await prisma.shiftSession.update({
      where: {
        id: shiftSession.id},
      data: {
        endedAt: today.dateAndTime,
        hours: hours * 1, // to get the float type
        cost: cost,
        isActive: false}});

    return res.status(200).json({
      data: updatedShiftSession,
      message: 'You Clocked Out Successfully'});
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withDriverAuthGuard(handler);

export const calculateHours = (startedAt: string, endedAt: string) => {
  const startDate = new Date(startedAt);
  const endDate = new Date(endedAt);
  const diff = endDate.getTime() - startDate.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours;
};
