import { generateCurrentTime } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';

interface IBody {
  name: string;
  icon: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name, icon }: IBody = req.body;

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

    const createdAt = generateCurrentTime();
    const createdBy: any = await getUserInfo(req, res);

    const newProductType = await prisma.itemType.create({
      data: {
        name: name,
        icon: icon,
        createdAt,
        createdBy: `Admin - ${createdBy.clientName}`,
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
