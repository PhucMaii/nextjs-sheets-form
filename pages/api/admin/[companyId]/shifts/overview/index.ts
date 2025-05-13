import { SHIFT_STATUS } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import { formatDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface IQuery {
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Method Not Allowed' });
    }

    const { startDate, endDate, companyId }: IQuery = req.query;

    if (!startDate || !endDate || !companyId) {
      return res
        .status(400)
        .json({ error: 'Missing startDate or endDate or companyId' });
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const shifts = await prisma.shiftSession.findMany({
      where: {
        date: {
          in: listOfDateString,
        },
        companyId: Number(companyId),
      },
      include: {
        driver: true,
      },
    });

    const totalHours = shifts.reduce(
      (acc: number, shift: any) => acc + (shift?.hours || 0),
      0,
    );

    const totalCosts = shifts.reduce(
      (acc: number, shift: any) => acc + (shift?.cost || 0),
      0,
    );

    const unpaidShifts = shifts.filter(
      (shift: any) => shift.status === SHIFT_STATUS.UNPAID,
    );
    const paidShifts = shifts.filter(
      (shift: any) => shift.status === SHIFT_STATUS.PAID,
    );

    const unpaidShiftCost = unpaidShifts.reduce(
      (acc: number, shift: any) => acc + (shift?.cost || 0),
      0,
    );

    const paidShiftCost = paidShifts.reduce(
      (acc: number, shift: any) => acc + (shift?.cost || 0),
      0,
    );

    const driverShifts = shifts.filter((shift) => shift.routeId !== null);
    const factoryShifts = shifts.filter((shift) => shift.routeId === null);

    // Track the total hours for each driver
    const driverReports = shifts.reduce((acc: any, shift: any) => {
      const { name } = shift.driver;

      const isExist = acc.find((accShift: any) => accShift.name === name);

      const fieldHours =
        shift.routeId !== null ? 'driverHours' : 'factoryHours';

      if (isExist) {
        isExist[fieldHours] += shift.hours;
        isExist.cost += shift.cost;
      } else {
        acc.push({
          name,
          [fieldHours]: shift.hours,
          cost: shift.cost,
        });
      }

      return acc;
    }, []);

    const sortedDriverWithTotalHours = driverReports.sort(
      (a: any, b: any) =>
        b.driverHours + b.factoryHours - (a.driverHours + a.factoryHours),
    );

    const sortedDriverWithFactoryHours = driverReports.sort(
      (a: any, b: any) => b.factoryHours - a.factoryHours,
    );

    const sortedDriverWithDriverHours = driverReports.sort(
      (a: any, b: any) => b.driverHours - a.driverHours,
    );

    const totalDriverHours = driverShifts.reduce(
      (acc: number, shift: any) => acc + (shift?.hours || 0),
      0,
    );

    const totalFactoryHours = factoryShifts.reduce(
      (acc: number, shift: any) => acc + (shift.hours || 0),
      0,
    );

    return res.status(200).json({
      driverShifts,
      factoryShifts,
      driverReports,
      sortedDriverWithFactoryHours,
      sortedDriverWithDriverHours,
      totalShifts: shifts.length,
      totalDriverShifts: driverShifts.length,
      totalFactoryShifts: factoryShifts.length,
      totalDriverHours,
      totalFactoryHours,
      totalHours,
      totalCosts,
      unpaidShifts,
      paidShifts,
      unpaidShiftCost,
      paidShiftCost,
      sortedDriverWithTotalHours,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
