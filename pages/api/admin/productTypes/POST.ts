import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  name: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name }: IBody = req.body;

    const sameNameProductType = await prisma.itemType.findFirst({
      where: {
        name: name,
      },
    });

    if (sameNameProductType) {
      return res.status(400).json({
        error: 'Product Type already exists',
      });
    }

    const newProductType = await prisma.itemType.create({
      data: {
        name: name,
      },
    });

    return res.status(200).json({
      message: 'Product Type created successfully',
      data: newProductType,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
