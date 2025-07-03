import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId }: IQuery = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const itemTypes = await prisma.itemType.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        inventoryItems: {
          include: {
            vendorItem: {
              include: {
                vendor: true,
              },
            },
          },
          orderBy: {
            indexPos: 'asc',
          },
        },
        itemType_category: true,
      },
      orderBy: {
        priority: 'asc',
      },
    });

    return res.status(200).json({ data: itemTypes });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
