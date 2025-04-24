import { websiteItemCategory } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const types = await prisma.itemType.findMany({
      include: {
        inventoryItems: true,
      },
    });

    const items = await prisma.item.findMany({
      where: {
        categoryId: websiteItemCategory,
      },
      include: {
        inventoryItem: {
          include: {
            type: true,
          },
        },
        options: {
          include: {
            unit: true,
          },
        },
      },
    });

    //  Add items to each type
    const typesWithItems = types.map((type) => ({
      ...type,
      items: items.filter((item) => item.inventoryItem?.type?.id === type.id),
    })).filter((type) => type.items.length > 0);

    return res.status(200).json({
      data: typesWithItems,
      message: 'Fetch All Types Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
