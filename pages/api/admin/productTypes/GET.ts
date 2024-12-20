import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
    id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (id) {
      const productType = await prisma.itemType.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          itemPreferences: true,
        },
      });

      return res.status(200).json({
        message: 'Fetch Product Type Successfully',
        data: productType,
      });
    }

    const productTypes = await prisma.itemType.findMany({
      include: {
        itemPreferences: true,
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
