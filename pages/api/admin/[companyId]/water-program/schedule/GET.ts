import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { formatDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, startDate, endDate }: IQuery = req.query;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Params missing' });
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const schedules = await prisma.programSchedule.findMany({
      where: { companyId: Number(companyId), date: { in: listOfDateString } },
      include: {
        waterProgram: {
          include: {
            zoneWaterPrograms: {
              include: {
                zoneProgram: true,
              },
            },
          },
        },
      },
    });

    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      name: schedule.waterProgram.name,
      zoneWaterPrograms: schedule.waterProgram.zoneWaterPrograms,
    }));

    return res.status(200).json({ data: formattedSchedules });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error' + error });
  }
}
