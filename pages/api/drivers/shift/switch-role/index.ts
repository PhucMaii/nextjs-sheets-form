import { days } from '@/app/lib/constant';
import { SHIFT_STATUS, WORKING_ROLE } from '@/app/utils/enum';
import { getDriverInfo } from '@/pages/api/utils/auth';
import {
  convertDeliveryDateStringToDate,
  getTodayDate,
} from '@/pages/api/utils/date';
import { PayrollType, PrismaClient, Route } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateHours } from '../clock-out';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { role } = req.body;

    const driver: any = await getDriverInfo(req, res);

    const today = getTodayDate();
    const date = convertDeliveryDateStringToDate(today.date);
    const day = days[date.getDay()];

    const currentShift = await prisma.shiftSession.findFirst({
      where: {
        // driverId: driver.id,
        employeeId: driver.id,
        date: today.date,
      },
    });

    if (role === currentShift?.role) {
      return res.status(400).json({ error: 'You are already clocked in' });
    }

    // If user has not clocked in yet -> create new shift with current role
    if (!currentShift) {
      let targetRoute = null;

      if (role === WORKING_ROLE.DRIVER) {
        targetRoute = driver.routes.find((route: Route) => {
          return route.day === day;
        });
      }

      const shiftSession = await prisma.shiftSession.create({
        data: {
          driverId: driver.id,
          employeeId: driver.id,
          date: today.date,
          startedAt: today.dateAndTime,
          isActive: true,
          routeId: targetRoute?.id || null,
          status: SHIFT_STATUS.UNPAID,
          role,
          companyId: driver.companyId,
        },
      });
      return res.status(200).json({
        data: shiftSession,
        message: 'Clock In With New Role Successfully',
      });
    }

    // If user has clocked in -> switch role
    // End the current shift
    const hours = calculateHours(currentShift.startedAt, today.dateAndTime);
    const cost =
      driver.payrollType === PayrollType.hourly
        ? hours * (driver?.payRate || 1)
        : 0;
        
    const updatedShiftSession = await prisma.shiftSession.update({
      where: {
        id: currentShift.id,
      },
      data: {
        endedAt: today.dateAndTime,
        hours: hours * 1, // to get the float type
        cost: cost,
        isActive: false,
      },
    });

    // Create new shift with new role
    if (role === WORKING_ROLE.DRIVER) {
      const targetRoute = driver.routes.find((route: Route) => {
        return route.day === day;
      });

      await prisma.shiftSession.create({
        data: {
          driverId: driver.id,
          employeeId: driver.id,
          date: today.date,
          startedAt: today.dateAndTime,
          isActive: true,
          routeId: targetRoute?.id || null,
          status: SHIFT_STATUS.UNPAID,
          role,
          companyId: driver.companyId,
        },
      });
    } else {
      await prisma.shiftSession.create({
        data: {
          driverId: driver.id,
          employeeId: driver.id,
          date: today.date,
          startedAt: today.dateAndTime,
          isActive: true,
          status: SHIFT_STATUS.UNPAID,
          role,
          companyId: driver.companyId,
        },
      });
    }

    return res.status(200).json({
      data: updatedShiftSession,
      message: 'Switch Role Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withDriverAuthGuard(handler);
