import { generateCurrentTime } from '@/app/utils/time';
import { getUserInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  inventoryItemId: number;
  image?: string;
  description: string;
  isBestSeller: boolean;
  typeId: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { inventoryItemId, image, description, isBestSeller, typeId }: IBody =
      req.body;

    const existingPreference = await prisma.itemPreference.findFirst({
      where: {
        inventoryItemId,
      },
    });

    if (existingPreference) {
      return res.status(400).json({
        error: 'Preference already exists either in this type or other type',
      });
    }

    const createdAt = generateCurrentTime();
    const createdBy: any = await getUserInfo(req, res);

    const newPreference = await prisma.itemPreference.create({
      data: {
        inventoryItemId,
        image: image || '',
        description,
        isBestSeller,
        typeId,
        createdAt,
        createdBy: `Admin - ${createdBy.clientName}`,
      },
    });

    return res.status(200).json({
      message: 'Product preference created successfully',
      data: newPreference,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
