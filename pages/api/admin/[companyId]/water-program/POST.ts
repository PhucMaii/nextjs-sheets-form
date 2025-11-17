import { ZoneProgram } from '@/app/admin/[companyId]/components/Farm/types';
import prisma from '@/client';
import { getTodayDate } from '@/pages/api/utils/date';
import { errorResponse } from '@/pages/api/utils/response';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { USER_ROLE } from '@/app/utils/enum';

interface IBody {
  name: string;
  days: number;
  hexColor: string;
  zonePrograms: ZoneProgram[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { name, days, zonePrograms, hexColor } = req.body as IBody;

    const createdAt = getTodayDate().dateAndTime;
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    const newWaterProgram = await prisma.waterProgram.create({
      data: {
        name,
        days,
        remainingDays: days,
        createdAt,
        createdBy,
        companyId: Number(companyId),
        hexColor,
      },
    });

    const newZonePrograms = zonePrograms.map((zoneProgram) => {
      return {
        zoneId: Number(zoneProgram.zoneId),
        duration: zoneProgram.duration,
        index: zoneProgram.index,
        createdAt,
        createdBy,
        companyId: Number(companyId),
      };
    });

    await prisma.zoneProgram.createMany({
      data: newZonePrograms,
    });

    // Fetch the just created zone programs
    const newZoneWater = await prisma.zoneProgram.findMany({
      where: {
        createdBy,
        createdAt,
      },
    });

    // Create connection between zone and water
    await prisma.zoneWater.createMany({
      data: newZoneWater.map((zoneProgram) => ({
        zoneProgramId: zoneProgram.id,
        waterId: newWaterProgram.id,
      })),
    });

    return res
      .status(200)
      .json({ message: 'Water program created successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    errorResponse(res, error);
  }
}
