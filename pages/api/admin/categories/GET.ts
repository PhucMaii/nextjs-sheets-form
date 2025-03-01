import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        users: true,
        items: {
          include: {
            inventoryItem: {
              include: {
                type: true,
              }
            }
          },
        },
      },
    });

    return res.status(200).json({
      data: categories,
      message: 'Fetch All Categories Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
