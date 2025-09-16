import { PROMOTION_STATUS } from '@/app/utils/enum';
import { IInventoryItem, IItemType } from '@/app/utils/type';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  itemTypes: IItemType[] | any;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { companyId } = req.query;
    const { itemTypes }: IBody = req.body;

    if (!itemTypes) {
      return res.status(404).json({ error: 'You are missing body data' });
    }

    // const formattedItemTypeIds = itemTypes.map((itemType: any) => {
    //   const actualId = Number(itemType.id.split(' - ')[1]);
    //   const itemsWithActualId = itemType.inventoryItems.map((item: any) => {
    //     return {
    //       ...item,
    //       id: Number(item.id.split(' - ')[1]),
    //     };
    //   });

    //   return {
    //     ...itemType,
    //     id: actualId,
    //     inventoryItems: itemsWithActualId,
    //   };
    // });

    // Get types and promotions into 2 arrays
    const updatedTypes = itemTypes
      ?.filter((itemType: any) => {
        return !itemType.id.includes('promotion');
      })
      .map((itemType: any) => {
        const items = itemType.inventoryItems.map((item: any) => {
          return {
            ...item,
            id: Number(item.id.split(' - ')[1]),
          };
        });
        return {
          ...itemType,
          id: Number(itemType.id.split(' - ')[1]),
          inventoryItems: items,
        };
      });

    const dbTypes = await prisma.itemType.findMany({
      where: {
        companyId: Number(companyId),
      },
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

    // Check and update types
    await checkAndUpdateContainers(updatedTypes, dbTypes, 'itemType', 'name');

    const dbInventoryItems: any = await prisma.inventoryItem.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        type: true,
      },
      orderBy: {
        indexPos: 'asc',
      },
    });

    // Check if any item has been re arranged
    await checkAndUpdateItemsArrangement(
      dbInventoryItems,
      updatedTypes,
      'indexPos',
      'typeId',
    );

    // Handle Promotion
    const updatedPromotions = itemTypes
      ?.filter((promotion: any) => {
        return (
          promotion.id.includes('promotion') &&
          promotion?.inventoryItems &&
          promotion?.inventoryItems?.length > 0
        );
      })
      ?.map((itemType: any) => {
        const items = itemType.inventoryItems.map((item: any) => {
          return {
            ...item,
            id: Number(item.id.split(' - ')[1]),
          };
        });
        return {
          ...itemType,
          id: Number(itemType.id.split(' - ')[1]),
          inventoryItems: items,
        };
      });

    const dbPromotions = await prisma.promotion.findMany({
      where: {
        companyId: Number(companyId),
        status: PROMOTION_STATUS.ACTIVE,
        isWebsite: null,
      },
      orderBy: {
        priority: 'asc',
      },
    });

    // Check promotion priority
    await checkAndUpdateContainers(
      updatedPromotions,
      dbPromotions,
      'promotion',
      'title',
    );

    // Turn visibility for all updated promotions
    await prisma.promotion.updateMany({
      where: {
        id: {
          in: updatedPromotions.map((promotion: any) => promotion.id),
        },
      },
      data: {
        visibility: true,
      },
    });

    const dbPromoItems: any = await prisma.inventoryItem.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        type: true,
      },
      orderBy: {
        promoIndexPos: 'asc',
      },
    });

    // Check if any promotion item has been re arranged
    await checkAndUpdateItemsArrangement(
      dbPromoItems,
      updatedPromotions,
      'promoIndexPos',
      'promotionId',
    );

    return res.status(200).json({ message: 'Update Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);

const convertInventoryItemsToTypeMap = (
  inventoryItems: IInventoryItem[],
  keyField: string = 'typeId',
) => {
  const itemTypeMap = inventoryItems.reduce((map: any, item: any) => {
    const key = item[keyField];

    // If reach to empty element, then skip
    if (!key) {
      return map;
    }

    if (!map[key]) {
      map[key] = [];
    }

    map[key].push(item);

    return map;
  }, {});

  return itemTypeMap;
};

export const fillInEmptyPosition = (
  inventoryItems: IInventoryItem[],
  rows: number,
) => {
  const itemNames: string[] = [];

  const maxNumberOfEl = rows * 2;

  if (!inventoryItems || inventoryItems.length === 0) {
    return [];
  }

  for (let i = 0; i < inventoryItems.length; i++) {
    const item = inventoryItems[i];

    if (!item) {
      itemNames.push('Empty');
    } else {
      // if (item.indexPos !== i + 1) {
      let pos = itemNames.length + 1; // indicate the next pos

      while (pos < (item?.indexPos || 1)) {
        if (item.typeId === 8) {
          console.log({
            item: { name: item.name, indexPos: item.indexPos },
            pos,
            itemNames,
          });
        }
        itemNames.push('Empty');
        pos++;
      }
      // }

      itemNames.push(item.name);
    }
  }

  while (itemNames.length < maxNumberOfEl) {
    itemNames.push('Empty');
  }

  return itemNames;
};

const checkAndUpdateContainers = async (
  updatedContainers: any[],
  dbContainers: any[],
  tableName: 'itemType' | 'promotion',
  compareField: string,
) => {
  const prisma: any = new PrismaClient();

  const updatedContainerNames = updatedContainers.map((container: any) => {
    return container[compareField];
  });

  const dbContainerNames = dbContainers.map((container) => {
    return container[compareField];
  });

  console.log(
    {
      updatedContainerNames,
      dbContainerNames,
      compare:
        JSON.stringify(updatedContainerNames) ===
        JSON.stringify(dbContainerNames),
    },
    'in checkAndUpdateContainers',
  );

  // Compare if types has any re arrangement
  if (
    JSON.stringify(updatedContainerNames) !== JSON.stringify(dbContainerNames)
  ) {
    // Re arrange types
    let priority = 1;
    for (let i = 0; i < updatedContainers.length; i++) {
      console.log(priority, 'priority');
      const container = updatedContainers[i];
      await prisma[tableName].update({
        where: { id: container.id },
        data: { priority },
      });
      priority++;
    }
  }
};

const checkAndUpdateItemsArrangement = async (
  dbInventoryItems: any[],
  updatedContainers: any[],
  posField: string,
  keyField: string,
) => {
  const prisma: any = new PrismaClient();

  // Convert inventory items to type map for easy retrieve
  const dbItemArrangementMap = convertInventoryItemsToTypeMap(
    dbInventoryItems,
    keyField,
  );

  for (const container of updatedContainers) {
    // Get 2 arrays of item names for easy compare
    const inventoryItemNames = fillInEmptyPosition(
      container.inventoryItems,
      container.rows,
    );
    const dbItemNames = fillInEmptyPosition(
      dbItemArrangementMap[container.id],
      container.rows,
    );

    // console.log({
    //   inventoryItemNames,
    //   dbItemNames,
    //   compare:
    //     JSON.stringify(inventoryItemNames) === JSON.stringify(dbItemNames),
    // });

    // Get the removed items from promotion (if in promotion mode currently)
    if (keyField === 'promotionId') {
      const removedItems = dbItemArrangementMap[container.id]
        ?.filter((item: any) => !inventoryItemNames.includes(item.name))
        .map((item: any) => item.id);

      if (removedItems && removedItems.length > 0) {
        await prisma.inventoryItem.updateMany({
          where: {
            id: {
              in: removedItems,
            },
          },
          data: {
            [posField]: null,
            [keyField]: null,
          },
        });
      }
    }

    // Check if any item has been re arranged and only update re arranged items
    if (JSON.stringify(inventoryItemNames) !== JSON.stringify(dbItemNames)) {
      // Re arrange
      let indexPos = 1;
      for (let i = 0; i < container.inventoryItems.length; i++) {
        const inventoryItem = container.inventoryItems[i];

        if (inventoryItem.name !== 'Empty') {
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { [posField]: indexPos, [keyField]: container.id },
          });
        }

        indexPos++;
      }
    }
  }
};
