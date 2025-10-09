import {
  Program,
  ZoneWater,
} from '@/app/admin/[companyId]/components/Farm/types';
import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, id } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (id) {
      const waterProgram: any = await prisma.waterProgram.findUnique({
        where: {
          id: Number(id),
          companyId: Number(companyId),
        },
        include: {
          zoneWaterPrograms: {
            include: {
              zoneProgram: true,
            },
            orderBy: {
              zoneProgram: {
                index: 'asc',
              },
            },
          },
        },
      });

      const formattedWaterProgram = formatWaterProgram(waterProgram);

      return res.status(200).json({ data: formattedWaterProgram });
    }

    const waterPrograms: any = await prisma.waterProgram.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        zoneWaterPrograms: {
          include: {
            zoneProgram: true,
          },
          orderBy: {
            zoneProgram: {
              index: 'asc',
            },
          },
        },
      },
    });

    const formattedWaterPrograms = waterPrograms.map((waterProgram: any) =>
      formatWaterProgram(waterProgram),
    );

    return res.status(200).json({ data: formattedWaterPrograms });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const formatWaterProgram = (waterProgram: Program) => {
  const totalDuration = waterProgram.zoneWaterPrograms.reduce(
    (acc: number, zoneWaterProgram: ZoneWater) =>
      acc + zoneWaterProgram.zoneProgram.duration,
    0,
  );
  return {
    ...waterProgram,
    duration: totalDuration,
  };
};
