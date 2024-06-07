import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    // Get all categories
    const cateogries = await prisma.category.findMany({
      include: {
        users: true
      }
    });

    return res.status(200).json({
      data: cateogries,
      message: 'Fetch All Categories Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
