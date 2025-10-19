import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { generateListOfDateString, YYYYMMDDFormat } from '@/app/utils/time';
import {
  formatDate,
  getTodayDate,
  normalizeDate,
} from '@/pages/api/utils/date';
import { USER_ROLE } from '@/app/utils/enum';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';

type CopyPrevPeriodType = 'month' | 'week';
interface CopyPrevPeriodBody {
  prevPeriodStartDate: string;
  prevPeriodEndDate: string;
  type: CopyPrevPeriodType;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const { prevPeriodStartDate, prevPeriodEndDate, type }: CopyPrevPeriodBody =
      req.body;

    if (!prevPeriodStartDate || !prevPeriodEndDate) {
      return res
        .status(400)
        .json({ message: 'Prev period start date and end date are required' });
    }

    const formattedPrevPeriodStartDate = normalizeDate(
      new Date(prevPeriodStartDate),
    );
    const formattedPrevPeriodEndDate = normalizeDate(
      new Date(prevPeriodEndDate),
    );

    console.log(
      { formattedPrevPeriodStartDate, formattedPrevPeriodEndDate },
      'formattedPrevPeriodStartDate, formattedPrevPeriodEndDate',
    );

    const prevPeriodListOfDateString = generateListOfDateString(
      formattedPrevPeriodStartDate,
      formattedPrevPeriodEndDate,
    );

    console.log({ prevPeriodListOfDateString }, 'prevPeriodListOfDateString');

    const prevPeriodSchedules = await prisma.programSchedule.findMany({
      where: {
        companyId: Number(companyId),
        date: {
          in: prevPeriodListOfDateString,
        },
      },
    });

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    const newCurrentSchedules = formatNewSchedules(
      prevPeriodSchedules,
      createdBy,
      type,
    );

    await prisma.programSchedule.createMany({
      data: newCurrentSchedules,
    });

    return res
      .status(200)
      .json({ message: 'Water program schedules copied successfully' });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default withAdminAuthGuard(handler);

export const formatNewSchedules = (
  prevPeriodSchedules: any,
  createdBy: string,
  type: CopyPrevPeriodType,
) => {
  return prevPeriodSchedules.map((schedule: any) => {
    const formattedDate = new Date(schedule.date);
    if (type === 'month') { // last month
      formattedDate.setMonth(formattedDate.getMonth() + 1);
    } else if (type === 'week') { // last week
      formattedDate.setDate(formattedDate.getDate() + 7);
    }
    return {
      companyId: schedule.companyId,
      programId: schedule.programId,
      status: schedule.status,
      time: schedule.time,
      createdAt: getTodayDate().dateAndTime,
      createdBy: createdBy,
      date: YYYYMMDDFormat(formattedDate),
    };
  });
};
