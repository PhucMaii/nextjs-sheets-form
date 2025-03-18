import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Item Type Id Not Provided',
      });
    }

    const prisma = new PrismaClient();

    const existingItemType = await prisma.itemType.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingItemType) {
      return res.status(404).json({
        error: 'Item Type Not Found',
      });
    }

    // // Remove item type id in all the selling items related
    // await prisma.item.updateMany({
    //   where: {
    //     typeId: Number(id),
    //   },
    //   data: {
    //     typeId: null,
    //   },
    // });

    // Remove item type id in all the inventory items related
    await prisma.inventoryItem.updateMany({
      where: {
        typeId: Number(id),
      },
      data: {
        typeId: null,
      },
    });

    // Move all the item preference related to another available item type
    const itemTypes = await prisma.itemType.findMany({
      where: {
        id: {
          not: Number(id),
        },
      },
    });
    await prisma.itemPreference.updateMany({
      where: {
        typeId: Number(id),
      },
      data: {
        typeId: itemTypes[0].id,
      },
    });

    await prisma.itemType.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({ message: 'Delete Item Type Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
