import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../orders/overview';
import { generateListOfDateString } from '@/app/utils/time';
import { ITEM_CATEGORIZED } from '../../orderedItems/PUT';
import { WaterStatus } from '@prisma/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { getTodayDate } from '@/pages/api/utils/date';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { updatedSchedules, startDate, endDate } = req.body;

    const formattedStartDate = normalizeDate(startDate);
    const formattedEndDate = normalizeDate(endDate);

    console.log({ formattedStartDate, formattedEndDate }, 'formattedStartDate, formattedEndDate');

    const listOfDates = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    console.log({ listOfDates }, 'listOfDates');

    const existingSchedules = await prisma.programSchedule.findMany({
      where: {
        companyId: Number(companyId),
        date: {
          in: listOfDates,
        },
      },
    });

    console.log({ existingSchedules }, 'existingSchedules');

    // categorize updated schedules
    const { createdSchedules, updateSchedules, deletedSchedules } =
      categorizeProgramSchedules(existingSchedules, updatedSchedules, 'id');

      console.log({
        createdSchedules,
        updateSchedules,
        deletedSchedules,
      })

    // Create new schedules
    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    if (createdSchedules.length > 0) {
      await prisma.programSchedule.createMany({
        data: createdSchedules.map((schedule) => ({
          companyId: Number(companyId),
          date: schedule.date,
          time: schedule.time,
          programId: schedule.programId,
          status: schedule?.status || WaterStatus.SCHEDULED,
          createdAt: today.dateAndTime,
          createdBy: createdBy,
        })),
      });
    }

    // Update existing schedules
    if (updateSchedules.length > 0) {
      console.log({ updateSchedules }, 'updateSchedules');
      const updateSchedulePromises = updateSchedules.map((schedule: any) => {
        return prisma.programSchedule.update({
          where: { id: schedule.id },
          data: {
            date: schedule.date,
            time: schedule.time,
          },
        });
      });

      await Promise.all(updateSchedulePromises);
    }

    // Delete deleted schedules
    if (deletedSchedules.length > 0) {
      await prisma.programSchedule.deleteMany({
        where: {
          id: { in: deletedSchedules.map((schedule) => schedule.id) },
        },
      });
    }

    return res.status(200).json({ message: 'Schedules updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const categorizeProgramSchedules = (
  existingSchedules: any[],
  updatedSchedules: any[],
  comparedField: string = 'id',
) => {
    const categorizedSchedules = [];
  for (const schedule of updatedSchedules) {
    const existingSchedule = existingSchedules.find(
      (existingSchedule) =>
        existingSchedule[comparedField] === Number(schedule[comparedField]),
    );

    if (!existingSchedule) {
      categorizedSchedules.push({
        ...schedule,
        type: ITEM_CATEGORIZED.CREATE,
      });
      continue;
    }

    if (
      existingSchedule.date !== schedule.date ||
      existingSchedule.time !== schedule.time
    ) {
      categorizedSchedules.push({
        ...schedule,
        id: Number(schedule.id),
        type: ITEM_CATEGORIZED.UPDATE,
      });
      continue;
    }

    categorizedSchedules.push({
      ...schedule,
      id: Number(schedule.id),
      type: ITEM_CATEGORIZED.REMAIN,
    });
  }

  const createdSchedules = categorizedSchedules.filter((schedule) => schedule.type === ITEM_CATEGORIZED.CREATE);
  const updateSchedules = categorizedSchedules.filter((schedule) => schedule.type === ITEM_CATEGORIZED.UPDATE);
  const deletedSchedules = categorizedSchedules.filter((schedule) => schedule.type === ITEM_CATEGORIZED.DELETE);

  return {
    createdSchedules,
    updateSchedules,
    deletedSchedules,
  };
};
