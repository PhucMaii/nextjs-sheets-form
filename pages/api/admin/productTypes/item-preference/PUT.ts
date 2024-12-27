import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  inventoryItemId: number;
  image: string;
  description: string;
  isBestSeller: boolean;
  typeId: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      id,
      inventoryItemId,
      image,
      description,
      isBestSeller,
      typeId,
    }: IBody = req.body;

    const existingPreference = await prisma.itemPreference.findUnique({
      where: {
        id,
      },
    });

    if (!existingPreference) {
      return res.status(404).json({ error: 'Item preference not found' });
    }

    // Check if inventoryItemid  exists in typeId already
    const existingInventoryItemAndType = await prisma.itemPreference.findFirst({
      where: {
        typeId: typeId,
        inventoryItemId: inventoryItemId,
      },
    });

    if (existingInventoryItemAndType) {
      return res
        .status(400)
        .json({ error: 'Item already exists in this type' });
    }

    await prisma.itemPreference.update({
      where: {
        id,
      },
      data: {
        inventoryItemId: inventoryItemId,
        image: image,
        description: description,
        isBestSeller: isBestSeller,
        typeId: typeId,
      },
    });

    return res
      .status(200)
      .json({ message: 'Item preference updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
