import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { ZoneProgram } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  name: string;
  zonePrograms: ZoneProgram[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, zonePrograms } = req.body as IBody;
    const { companyId } = req.query;

    const existingWaterProgram = await prisma.waterProgram.findUnique({
      where: { id: Number(id) },
      include: {
        zoneWaterPrograms: {
          include: {
            zoneProgram: true,
          },
        },
      },
    });

    if (!existingWaterProgram) {
      return res.status(404).json({ error: 'Water program not found' });
    }

    if (name !== existingWaterProgram.name) {
      await prisma.waterProgram.update({
        where: { id: Number(id) },
        data: {
          name,
        },
      });
    }

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    // Check if is there any change in zone programs
    const zoneProgramsUpdate = zonePrograms.map(async (zoneProgram, idx) => {
      const existingZoneProgram = existingWaterProgram.zoneWaterPrograms.find(
        (zwp) => zwp.zoneProgram.id == zoneProgram.id,
      );

      // CREATE NEW ZONE PROGRAM
      if (!existingZoneProgram) {
        const newZoneProgram = await prisma.zoneProgram.create({
          data: {
            zoneId: Number(zoneProgram.zoneId),
            duration: zoneProgram.duration,
            index: zoneProgram.index,
            createdAt: today.dateAndTime,
            createdBy: createdBy,
            companyId: Number(companyId),
          },
        });
        
        return prisma.zoneWater.create({
          data: {
            zoneProgramId: newZoneProgram.id,
            waterId: Number(id),
          },
        });
      }

      if (
        existingZoneProgram.zoneProgram.duration !== zoneProgram.duration ||
        existingZoneProgram.zoneProgram.index !== idx + 1 ||
        existingZoneProgram.zoneProgram.zoneId !== zoneProgram.zoneId
      ) {
        return prisma.zoneProgram.update({
          where: { id: existingZoneProgram.zoneProgram.id },
          data: {
            duration: zoneProgram.duration,
            index: idx + 1,
            zoneId: Number(zoneProgram.zoneId),
          },
        });
      }

      return null;
    });

    await Promise.all(zoneProgramsUpdate);

    // Check any deleted zone programs
    const deletedZonePrograms = existingWaterProgram.zoneWaterPrograms.filter(
      (zwp) => !zonePrograms.some((zp) => zp.id === zwp.zoneProgram.id),
    );

    if (deletedZonePrograms.length > 0) {
      await prisma.zoneProgram.deleteMany({
        where: {
          id: { in: deletedZonePrograms.map((zwp) => zwp.zoneProgram.id) },
        },
      });
    }

    return res
      .status(200)
      .json({ message: 'Water program updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
