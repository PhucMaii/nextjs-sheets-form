import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  companyId?: string;
  year?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, year } = req.query as IQuery;

    if (!companyId || !year) {
      return res
        .status(400)
        .json({ error: 'Company ID and year are required' });
    }

    const creditReports = await prisma.creditReport.findMany({
      where: {
        companyId: Number(companyId),
        reportedDate: {
          contains: year,
        },
      },
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
            items: true,
          },
        },
      },
    });

    return res.status(200).json({
      data: creditReports,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
