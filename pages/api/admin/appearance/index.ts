import { IInventoryItem, IItemType } from '@/app/utils/type';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  itemTypes: IItemType[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { itemTypes }: IBody = req.body;

    if (!itemTypes) {
      return res.status(404).json({ error: 'You are missing body data' });
    }

    const dbTypes = await prisma.itemType.findMany({
      include: {
        inventoryItems: {
          include: {
            vendorItem: {
              include: {
                vendor: true,
              },
            },
          },
          orderBy: {
            indexPos: 'asc',
          },
        },
      },
      orderBy: {
        priority: 'asc',
      },
    });

    if (!dbTypes) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Get 2 array of type names for easy compare from itemTypes and dbTypes
    const updatedTypeNames = itemTypes.map((itemType) => {
      return itemType.name;
    });

    const dbTypeNames = dbTypes.map((itemType) => {
      return itemType.name;
    });

    // Compare if types has any re arrangement
    if (JSON.stringify(updatedTypeNames) !== JSON.stringify(dbTypeNames)) {
      // Re arrange types
      let priority = 1;
      for (let i = 0; i < itemTypes.length; i++) {
        const itemType = itemTypes[i];
        await prisma.itemType.update({
          where: { id: itemType.id },
          data: { priority },
        });
        priority++;
      }
    }

    // Check if any item has been re arranged
    const dbInventoryItems: any = await prisma.inventoryItem.findMany({
      include: {
        type: true,
      },
      orderBy: {
        indexPos: 'asc',
      },
    });

    // Convert to a map of arrays of item names, for fast and easily extract the items belong to each type
    const dbItemArrangementMap =
      convertInventoryItemsToTypeMap(dbInventoryItems);

    for (const itemType of itemTypes) {
      const inventoryItemNames = fillInEmptyPosition(itemType.inventoryItems);
      const dbItemNames = fillInEmptyPosition(dbItemArrangementMap[itemType.id]);

      // Check if any item has been re arranged and only update re arranged items
      if (
        JSON.stringify(inventoryItemNames) !==
        JSON.stringify(dbItemNames)
      ) {
        // Re arrange
        let indexPos = 1;
        for (let i = 0; i < itemType.inventoryItems.length; i++) {
          const inventoryItem = itemType.inventoryItems[i];

          if (inventoryItem.name !== 'Empty') {
            await prisma.inventoryItem.update({
              where: { id: inventoryItem.id },
              data: { indexPos, typeId: itemType.id },
            });
          }

          indexPos++;
        }
      }
    }

    return res.status(200).json({ message: 'Update Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);

const convertInventoryItemsToTypeMap = (inventoryItems: IInventoryItem[]) => {
  const itemTypeMap = inventoryItems.reduce(
    (map: any, item: IInventoryItem) => {
      const key = item?.typeId;

      // If reach to empty element, then skip
      if (!key) {
        return map;
      }

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(item);

      return map;
    },
    {},
  );

  return itemTypeMap;
};

export const fillInEmptyPosition = (inventoryItems: IInventoryItem[]) => {
  const itemNames: string[] = [];

  if (!inventoryItems || inventoryItems.length === 0) {
    return [];
  }

  for (let i = 0; i < inventoryItems.length; i++) {
    const item = inventoryItems[i];

    if (!item) {
      itemNames.push('Empty');
    } else {
      if (item.indexPos !== i + 1) {
        let pos = i + 1;

        while (pos < (item?.indexPos || 1)) {
          itemNames.push('Empty');
          pos++;
        }
      }

      itemNames.push(item.name);
    }
  }

  return itemNames
};
