import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, id } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (id) {
      const bundleProgram = await prisma.bundleProgram.findUnique({
        where: {
          id: Number(id),
          companyId: Number(companyId),
        },
        include: {
          dayPrograms: {
            include: {
              program: {
                include: {
                  zoneWaterPrograms: {
                    include: {
                      zoneProgram: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              day: 'asc',
            },
          },
        },
      });
      return res.status(200).json({ data: bundleProgram });
    }

    const bundlePrograms = await prisma.bundleProgram.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        dayPrograms: {
          include: {
            program: {
              include: {
                zoneWaterPrograms: {
                  include: {
                    zoneProgram: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ data: bundlePrograms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
