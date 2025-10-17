import { USER_ROLE } from '@/app/utils/enum';
import { IDayProgram } from '@/app/utils/type';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { name, daySchedules } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!daySchedules) {
      return res.status(400).json({ error: 'Day schedules are required' });
    }

    const createdAt = getTodayDate().dateAndTime;
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    const newBundleProgram = await prisma.bundleProgram.create({
      data: {
        name,
        createdAt,
        createdBy,
        companyId: Number(companyId),
      },
    });

    // Create day programs
    await prisma.dayProgram.createMany({
      data: daySchedules.flatMap((daySchedule: any) => {
        return daySchedule.programs.map((program: IDayProgram) => ({
          day: daySchedule.day,
          time: program.time,
          bundleProgramId: newBundleProgram.id,
          programId: Number(program.programId),
        }))
      }),
    });

    return res
      .status(200)
      .json({ message: 'Bundle program created successfully' });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
