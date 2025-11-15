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

    const [rawTime, meridiem] = today.time.trim().split(' ');

    const [rawHour, rawMinute] = rawTime.split(':');

    let hour = Number(rawHour);
    const minute = rawMinute;

    // Convert to 24h
    if (meridiem === 'PM' && hour !== 12) {
      hour += 12;
    } else if (meridiem === 'AM' && hour === 12) {
      hour = 0;
    }

    const queryTime = `${hour.toString().padStart(2, '0')}:${minute}`;
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

    return res
      .status(200)
      .json({ message: 'Water program activated successfully' });
  } catch (error) {
    console.error('Error activating water program:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
