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

    const bestSellerItems = await prisma.itemPreference.findMany({
      where: {
        isBestSeller: true,
      },
    });

    const weeklySpecials = await prisma.itemPreference.findMany({
      where: {
        inventoryItem: {
          isPromotion: true,
        },
      },
    });

    return res.status(200).json({
      bestSellerItems,
      weeklySpecials,
      message: 'Fetch Best Seller Items Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
