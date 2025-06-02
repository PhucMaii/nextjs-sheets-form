import { USER_ROLE } from '@/app/utils/enum';
import {
  convertToDateStyleFull,
  generateListOfDateString,
  YYYYMMDDFormat,
} from '@/app/utils/time';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import {
  formatDate,
  formatDateString,
  getTodayDate,
} from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const {
      lastWeekStartedDate,
      lastWeekEndedDate,
      currentWeekStartedDate,
      currentWeekEndedDate,
    } = req.body;

    if (
      !companyId ||
      !lastWeekStartedDate ||
      !lastWeekEndedDate ||
      !currentWeekStartedDate ||
      !currentWeekEndedDate
    ) {
      return res
        .status(400)
        .json({ message: 'Missing companyId or startedDate or endedDate' });
    }

    const formattedStartDate = formatDate(lastWeekStartedDate);
    const formattedEndDate = formatDate(lastWeekEndedDate);

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    console.log({
      lastWeekStartedDate,
      lastWeekEndedDate,
      formattedStartDate,
      formattedEndDate,
      listOfDateString,
    });

    const lastWeekShifts = await prisma.scheduledShift.findMany({
      where: {
        companyId: Number(companyId),
        queryDate: {
          in: listOfDateString,
        },
      },
      include: {
        employee: true,
      },
    });

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    const newCurrentShifts = lastWeekShifts.map((shift) => {
      const formattedStartedAt = new Date(shift.startedAt);
      formattedStartedAt.setDate(formattedStartedAt.getDate() + 7);

      const formattedEndedAt = new Date(shift?.endedAt || '');
      formattedEndedAt.setDate(formattedEndedAt.getDate() + 7);

      // const pstStartedAt = convertToPSTDate(formattedStartedAt);
      // const pstEndedAt = convertToPSTDate(formattedEndedAt);

      return {
        queryDate: YYYYMMDDFormat(formattedStartedAt),
        date: convertToDateStyleFull(formattedStartedAt),
        startedAt: formatDateString(formattedStartedAt),
        endedAt: formatDateString(formattedEndedAt),
        hours: shift.hours,
        cost:
          shift?.cost ||
          (shift?.hours || 0) * (shift?.employee?.payRate || 0),
        role: shift.role,
        assignedAt: today.dateAndTime,
        assignedBy: createdBy,
        createdAt: today.dateAndTime,
        createdBy: createdBy,
        companyId: Number(companyId),
        employeeId: shift.employeeId,
      };
    });

    await prisma.scheduledShift.createMany({
      data: newCurrentShifts,
    });

    return res.status(200).json({ message: 'Shifts copied successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default withAdminAuthGuard(handler);
