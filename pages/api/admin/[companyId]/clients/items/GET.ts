import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  categoryId?: string;
  // subCategoryId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { categoryId } = req.query as RequestQuery;

    const items = await prisma.item.findMany({
      where: {
        categoryId: Number(categoryId),
      },
      include: {
        inventoryItem: {
          include: {
            type: {
              include: {
                itemType_category: true,
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

    return res.status(200).json({
      data: items,
      message: 'Fetch Items For Specific Client Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
