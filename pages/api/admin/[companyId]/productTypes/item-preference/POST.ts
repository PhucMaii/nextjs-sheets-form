import { getUserInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  inventoryItemId: number;
  name: string;
  inventoryUnitId: number;
  image?: string;
  description: string;
  price: number;
  isShowDiscount?: boolean;
  prevPrice?: number;
  isBestSeller: boolean;
  typeId: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      inventoryItemId,
      image,
      name,
      inventoryUnitId,
      description,
      price,
      isShowDiscount,
      prevPrice,
      isBestSeller,
      typeId,
    }: IBody = req.body;

    // const existingPreference = await prisma.itemPreference.findFirst({
    //   where: {
    //     inventoryItemId,
    //   },
    // });

    // if (existingPreference) {
    //   return res.status(400).json({
    //     error: 'Preference already exists either in this type or other type',
    //   });
    // }

    const { date, time } = getTodayDate();
    const createdBy: any = await getUserInfo(req, res);

    console.log(inventoryUnitId, 'INVENTORY UNIT ID');

    const newPreference = await prisma.itemPreference.create({
      data: {
        inventoryItemId,
        image: image || '',
        description,
        name,
        inventoryUnitId,
        isBestSeller,
        price,
        isShowDiscount,
        prevPrice,
        typeId,
        createdAt: `${date} ${time}`,
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
