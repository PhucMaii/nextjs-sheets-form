import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
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
                }
              },
            },
          },
        },
      }
    });

    return res.status(200).json({ data: bundlePrograms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
