import { USER_ROLE } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { formatDate, getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PaymentStatus, PayrollType } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId, startDate, endDate } = req.query as IQuery;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const formattedStartDate = formatDate(startDate as string);
    const formattedEndDate = formatDate(endDate as string);

    const listOfDateStrings = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    // console.log({ listOfDateStrings, formattedStartDate, formattedEndDate });

    const { yyyymmddStartDate, yyyymmddEndDate, employeeIds } = req.body;

    // Find schedule shifts
    const scheduleShifts = await prisma.scheduledShift.findMany({
      where: {
        companyId: Number(companyId),
        queryDate: {
          in: listOfDateStrings,
        },
        employeeId: {
          in: employeeIds,
        },
      },
      include: {
        employee: true,
      },
    });

    // Map schedule shifts to each employee
    const employeePayrolls: any = scheduleShifts.reduce((acc: any, shift) => {
      const employeeId = shift.employeeId;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employeeId,
          hours: 0,
          total:
            shift?.employee?.payrollType === PayrollType.monthly
              ? shift?.employee?.payRate || 0
              : 0,
          shifts: 0,
        };
      }

      acc[employeeId].shifts += 1;
      acc[employeeId].hours += shift.hours || 0;

      if (shift?.employee?.payrollType === PayrollType.hourly) {
        const shiftTotal =
          (shift?.employee?.payRate || 0) * (shift?.hours || 0);
        acc[employeeId].total += shiftTotal;
      }

      return acc;
    }, {});

    const toady = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    const newPayrolls = Object.values(employeePayrolls).map((employee: any) => {
      return {
        companyId: Number(companyId),
        employeeId: employee.employeeId,
        hours: employee.hours,
        total: employee.total,
        startDate: yyyymmddStartDate,
        endDate: yyyymmddEndDate,
        createdAt: toady.dateAndTime,
        createdBy: createdBy,
        status: PaymentStatus.Unpaid,
      };
    });

    await prisma.payroll.createMany({
      data: newPayrolls,
    });

    return res
      .status(200)
      .json({ message: 'Payroll generated successfully', data: newPayrolls });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
