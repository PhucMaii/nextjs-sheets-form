import { itemsEachRow } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthGuard from '../utils/withAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();

    const itemTypes = await prisma.itemType.findMany({
      include: {
        inventoryItems: {
          orderBy: {
            indexPos: 'asc',
          },
        },
      },
    });

    // Fill in all empty position
    const filledInItemTypes = itemTypes.map((type: any) => {
      const numberOfEl = (type?.rows || 1) * itemsEachRow;

      const newItems = [];
      let numberOfEmpty = 0;

      let arrayIndex = 0;
      while (arrayIndex < numberOfEl && newItems.length < numberOfEl) {
        const item = type.inventoryItems[arrayIndex];

        // If there is no item, then add empty items to fill up space
        if (!item) {
          newItems.push({
            id: Math.round(Math.random() * 1000000 + 80000000 + type.id / arrayIndex), // Create random id that will not be same as either type id or any items id
            indexPos: arrayIndex + 1,
            name: 'Empty',
            dataType: 'Empty',
            typeId: type.id,
          });
          numberOfEmpty++;
        } else {
          // If indexPos not equal to its position
          if (item.indexPos !== arrayIndex + 1) {
            // Hold that item and have another loop to keep creating empty items until the current item has the correct position
            let pos = arrayIndex + 1 + numberOfEmpty;
            while (pos < item.indexPos) {
              newItems.push({
                id: Math.round(Math.random() * 1000000 + 20000000 + type.id / pos), // Create random id that will not be same as either type id or any items id
                indexPos: pos,
                name: 'Empty',
                dataType: 'Empty',
                typeId: type.id,
              });

              numberOfEmpty++;
              pos++;
            }
          }
          // Add that item to return array when the nested loop is executed
          newItems.push(item);
        }

        arrayIndex++;
      }

      return {
        ...type,
        inventoryItems: newItems,
      };
    });

    const displayItemTypes = filledInItemTypes.reduce((acc: any, type: any) => {
      const key = type.name;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(...type.inventoryItems);

      return acc;
    }, {});

    return res.status(200).json({
      data: filledInItemTypes,
      itemTypes: displayItemTypes,
      message: 'Fetch Appearance Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'There was an error: ' + error,
    });
  }
};

export default withAuthGuard(handler);
