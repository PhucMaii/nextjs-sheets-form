import { calculateNextIndexPosAndRows } from '@/pages/api/utils/appearance';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id?: number;
  color?: string;
  idList?: number[];
  typeId: number;
  image?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();

    const { id, color, idList, typeId, image }: IBody = req.body;

    
    if (id) {
      // const actualId = id.toString().split(' - ')[1];
      const existingInventory = await prisma.inventoryItem.findUnique({
        where: {
          id,
        },
      });

      if (!existingInventory) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      if (existingInventory.color !== color) {
        await prisma.inventoryItem.update({
          where: {
            id,
          },
          data: {
            color,
          },
        });
      }

      if (existingInventory.image !== image) {
        await prisma.inventoryItem.update({
          where: {
            id,
          },
          data: {
            image,
          },
        });
      }

      if (existingInventory.typeId === typeId) {
        return res.status(200).json({
          data: existingInventory,
          message: 'Update Item Successfully',
        });
      }

      const existingType = await prisma.itemType.findUnique({
        where: {
          id: typeId,
        },
        include: {
          inventoryItems: true,
        },
      });

      if (!existingType) {
        return res.status(404).json({ error: 'Item type not found' });
      }

      const { nextPos, newRows } = await calculateNextIndexPosAndRows(
        typeId,
        1,
      );

      const updatedInventory = await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          typeId,
          indexPos: nextPos[0],
        },
      });

      // Update item type rows
      await prisma.itemType.update({
        where: {
          id: typeId,
        },
        data: {
          rows: newRows,
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
      const { nextPos, newRows } = await calculateNextIndexPosAndRows(
        typeId,
        idList.length,
      );

      for (let i = 0; i < idList.length; i++) {
        await prisma.inventoryItem.update({
          where: {
            id: idList[i],
          },
          data: {
            typeId,
            indexPos: nextPos[i],
          },
        });
      }

      // Update item type rows
      await prisma.itemType.update({
        where: {
          id: typeId,
        },
        data: {
          rows: newRows,
        },
      });

      // const updatedInventory = await prisma.inventoryItem.updateMany({
      //   where: {
      //     id: {
      //       in: idList,
      //     },
      //   },
      //   data: {
      //     typeId,
      //   },
      // });

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
