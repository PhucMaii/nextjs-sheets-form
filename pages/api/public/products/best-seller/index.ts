import { websiteItemCategory } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const bestSellerItems = await prisma.item.findMany({
      where: {
        categoryId: websiteItemCategory,
        isBestSeller: true,
        availability: true,
      },
      include: {
        options: true,
        inventoryItem: true,
      },
    });

    const promotion = await prisma.promotion.findFirst({
      where: {
        isWebsite: true,
        status: 'ACTIVE',
        visibility: true,
      },
      include: {
        websiteItems: {
          include: {
            options: {
              include: {
                unit: true,
              },
            },
            inventoryItem: true,
          },
        },
      },
    });

    return res.status(200).json({
      bestSellerItems,
      promotion,
      message: 'Fetch Best Seller Items Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
