import { calculateQtyLeft } from '@/pages/api/utils/items';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  categoryId?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { categoryId, companyId } = req.query as RequestQuery;

    if (!categoryId || !companyId) {
      return res.status(404).json({
        error: 'Parameters are missing',
      });
    }

    const items = await prisma.item.findMany({
      where: {
        categoryId: Number(categoryId),
        companyId: Number(companyId),
      },
      include: {
        inventoryItem: {
          include: {
            type: {
              include: {
                itemType_category: true,
              },
            },
            vendorItem: {
              include: {
                fifo: true,
              },
            },
          },
        },
        inventoryUnit: true,
        category: {
          include: {
            itemType_category: {
              include: {
                itemType: true,
              },
            },
          },
        },
        options: {
          include: {
            unit: true,
          },
        },
      },
      orderBy: {
        inventoryItem: {
          indexPos: 'asc',
        },
      },
    });

    const itemsWithQtyLeft = items.map((item: any) => {
      const qtyLeft = calculateQtyLeft(item);
      return { ...item, qtyLeft };
    });

    return res.status(200).json({
      data: itemsWithQtyLeft,
      message: 'Fetch Items For Specific Client Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
