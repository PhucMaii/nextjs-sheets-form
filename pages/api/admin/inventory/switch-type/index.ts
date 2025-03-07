import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id?: number;
  idList?: number[];
  typeId: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();

    const { id, idList, typeId }: IBody = req.body;

    if (id) {
      const existingInventory = await prisma.inventoryItem.findUnique({
        where: {
          id,
        },
      });

      if (!existingInventory) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      if (existingInventory.typeId === typeId) {
        return res.status(200).json({ data: existingInventory });
      }

      const existingType = await prisma.itemType.findUnique({
        where: {
          id: typeId,
        },
        include: {
          inventoryItems: true
        }
      });

      if (!existingType) {
        return res.status(404).json({ error: 'Item type not found' });
      }

      const updatedInventory = await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          typeId,
          indexPos: existingType.inventoryItems.length,
        },
      });

      // // Update all related selling items
      // await prisma.item.updateMany({
      //   where: {
      //     inventoryItemId: id,
      //   },
      //   data: {
      //     typeId,
      //   },
      // });

      return res.status(200).json({
        data: updatedInventory,
        message: 'Switch Item Type Successfully',
      });
    } else if (idList) {
      const updatedInventory = await prisma.inventoryItem.updateMany({
        where: {
          id: {
            in: idList,
          },
        },
        data: {
          typeId,
        },
      });

      // // Update all related selling items
      // await prisma.item.updateMany({
      //   where: {
      //     inventoryItemId: {
      //       in: idList,
      //     },
      //   },
      //   data: {
      //     typeId,
      //   },
      // });

      return res.status(200).json({
        data: updatedInventory,
        message: 'Switch Item Type Successfully',
      });
    } else {
      return res.status(400).json({ error: 'Inventory item id not provided' });
    }
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
