import { NextApiRequest, NextApiResponse } from 'next';
import { websiteItemCategory } from '@/app/lib/constant';
import prisma from '@/client';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all items from website category
    const items = await prisma.item.findMany({
      where: {
        categoryId: websiteItemCategory,
      },
      include: {
        options: {
          include: {
            unit: true,
            item: true,
          },
        },
        inventoryUnit: true,
        inventoryItem: {
          include: {
            vendorItem: {
              include: {
                unit: true,
              },
            },
            type: true,
          },
        },
        category: {
          include: {
            itemType_category: {
              include: {
                itemType: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Items fetched successfully',
      data: items,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
}
