import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  companyId?: string;
  id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, id } = req.query as IQuery;

    if (!companyId || !id) {
      return res.status(400).json({ error: 'Company ID and ID are required' });
    }

    const creditReport = await prisma.creditReport.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        creditItems: {
          include: {
            inventoryItem: true,
            orderedItem: true,
          },
        },
        order: {
          include: {
            user: true,
            items: {
              include: {
                inventoryItem: true,
                inventoryUnit: true,
                fifo: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ data: creditReport });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
