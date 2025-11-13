import prisma from '@/client';
import { WaterStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { runZonesSequentially } from '../../admin/[companyId]/water-program/activate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const today = getTodayDate();
    console.log({ today }, 'today');

    const isPM = today.time.split(' ')[1] === 'PM';
    const time = today.time.split(' ')[0];
    let hour: string = time.split(':')[0];

    console.log({ isPM, hour, time, today: today.dateAndTime }, 'isPM, hour, time' );

    if (isPM && Number(hour) !== 12) {
      // if hour is evening and not 12, add 12 to the hour
      hour = (Number(hour) + 12).toString();
    } else if (!isPM && Number(hour) === 12) {
      // if hour is morning and 12, set to 00
      hour = '00';
    } else if (Number(hour) < 10) {
      // if hour is less than 10, add a 0 to the front
      hour = `0${hour}`;
    }

    const minute = time.split(':')[1];

    const queryTime = `${hour}:${minute}`;
    console.log({ queryTime }, 'queryTime');

    const schedulePrograms = await prisma.programSchedule.findMany({
      where: {
        status: WaterStatus.SCHEDULED,
        date: today.date,
        time: queryTime,
      },
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

    for (const scheduleProgram of schedulePrograms) {
      await prisma.waterProgram.update({
        where: { id: scheduleProgram.waterProgram.id },
        data: {
          isActive: true,
        },
      });

      await runZonesSequentially(
        scheduleProgram.waterProgram.id,
        scheduleProgram.waterProgram.zoneWaterPrograms,
      );
    }

    // After all zones are activated, update the schedule program status to ACTIVE
    await prisma.programSchedule.updateMany({
      where: {
        id: {
          in: schedulePrograms.map((scheduleProgram) => scheduleProgram.id),
        },
      },
      data: { status: WaterStatus.FINISHED },
    });
    
    return res.status(200).json({ message: 'Water program activated successfully' });
  } catch (error) {
    console.error('Error activating water program:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
