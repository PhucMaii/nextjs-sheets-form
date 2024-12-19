import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const productTypes = await prisma.itemType.findMany({
      include: {
        items: true,
      },
    });

    return res.status(200).json({
      message: 'Fetch Product Types Successfully',
      data: productTypes,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
