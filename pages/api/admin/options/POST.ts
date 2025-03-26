import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  name: string;
  price: number;
  unitId: number;
  itemId: number;
  selectedCategoryIds: number[];
  inventoryItemId: number; // for finding items in selected category
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const {
      name,
      price,
      unitId,
      itemId,
      selectedCategoryIds,
      inventoryItemId,
    }: IBody = req.body;

    // Check is unitId existed in itemId
    const sameUnitOption = await prisma.option.findFirst({
      where: {
        unitId,
        itemId,
      },
    });

    if (sameUnitOption) {
      return res.status(500).json({
        error: 'Option Name Existed',
      });
    }

    const newOption = await prisma.option.create({
      data: {
        name,
        price,
        availability: true,
        unitId,
        itemId,
        inventoryItemId
      },
    });

    const allItemsInvolved = await prisma.item.findMany({
      where: {
        id: {
          not: itemId,
        },
        inventoryItemId,
        categoryId: {
          in: selectedCategoryIds,
        },
      },
    });

    const allItemsInvolvedIds = allItemsInvolved.map((item: any) => item.id);

    // Find all options related to the items
    const allOptionsInvolved = await prisma.option.findMany({
      where: {
        itemId: {
          in: allItemsInvolvedIds,
        },
      },
    });

    // Delete the old ones
    await prisma.option.deleteMany({
      where: {
        id: {
          in: allOptionsInvolved.map((option: any) => option.id),
        },
      },
    });

    // Create new options
    const newOptions = allItemsInvolved.map((item: any) => {
      return {
        name,
        price,
        availability: true,
        unitId,
        itemId: item.id,
        inventoryItemId
      };
    });

    await prisma.option.createMany({
      data: newOptions,
    });

    return res.status(201).json({
      data: newOption,
      message: 'Create New Option Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
