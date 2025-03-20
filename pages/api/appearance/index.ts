import { itemsEachRow } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthGuard from '../utils/withAuthGuard';
import { PROMOTION_STATUS } from '@/app/utils/enum';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();

    // Handle Promotion
    const promotions = await prisma.promotion.findMany({
      where: {
        status: PROMOTION_STATUS.ACTIVE,
      },
      include: {
        items: {
          orderBy: {
            promoIndexPos: 'asc',
          },
        },
      },
      orderBy: {
        priority: 'asc',
      },
    });

    const filledInPromotions = fillEmptyPosInArrayOfContainers(
      promotions,
      'items',
      'promotion_',
      'title',
      'promoIndexPos',
    );

    // console.log(filledInPromotions[0].inventoryItems, 'filledInPromotions');

    // Handle Item Types
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
    const filledInItemTypes = fillEmptyPosInArrayOfContainers(
      itemTypes,
      'inventoryItems',
      '',
      'name',
    );

    // Convert to a map of typeName -> inventoryItems
    const displayItemTypes = filledInItemTypes.reduce((acc: any, type: any) => {
      const key = type.name;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(...type.inventoryItems);

      return acc;
    }, {});

    // Convert to a map of promotionName -> inventoryItems
    const displayPromotions = filledInPromotions.reduce(
      (acc: any, promotion: any) => {
        const key = promotion.title;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(...promotion.inventoryItems);

        return acc;
      },
      {},
    );

    return res.status(200).json({
      data: [...filledInPromotions, ...filledInItemTypes],
      itemTypes: displayItemTypes,
      promotions: displayPromotions,
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

const fillEmptyPosInArrayOfContainers = (
  containers: any,
  itemField: string,
  idPrefix: string,
  fieldName: string,
  indexPosField: string = 'indexPos',
) => {
  return containers.map((container: any) => {
    const numberOfEl = (container?.rows || 1) * itemsEachRow;

    const newItems = [];
    let numberOfEmpty = 0;

    let arrayIndex = 0;
    while (arrayIndex < numberOfEl && newItems.length < numberOfEl) {
      const item = container[itemField][arrayIndex];

      // If there is no item, then add empty items to fill up space
      if (!item) {
        newItems.push({
          id:
            idPrefix +
            'item - ' +
            Math.round(
              Math.random() * 1000000 + 80000000 + container.id / arrayIndex,
            ), // Create random id that will not be same as either type id or any items id
          // id: 'item - ' + type.id,
          indexPos: arrayIndex + 1,
          name: 'Empty',
          dataType: 'Empty',
          typeId: container.id,
        });
        numberOfEmpty++;
      } else {
        // If indexPos not equal to its position
        if (item[indexPosField] !== arrayIndex + 1) {
          // Hold that item and have another loop to keep creating empty items until the current item has the correct position
          let pos = arrayIndex + 1 + numberOfEmpty;
          while (pos < item[indexPosField]) {
            newItems.push({
              // id: Math.round(Math.random() * 1000000 + 20000000 + type.id / pos), // Create random id that will not be same as either type id or any items id
              id:
                idPrefix +
                'item - ' +
                Math.round(
                  Math.random() * 1000000 + 80000000 + container.id / pos,
                ),
              indexPos: pos,
              name: 'Empty',
              dataType: 'Empty',
              typeId: container.id,
            });

            numberOfEmpty++;
            pos++;
          }
        }
        // Add that item to return array when the nested loop is executed
        newItems.push({
          ...item,
          id: idPrefix + 'item - ' + item.id,
          indexPos: item[indexPosField],
        });
      }

      arrayIndex++;
    }

    return {
      ...container,
      id: idPrefix + 'container - ' + container.id,
      name: container[fieldName],
      inventoryItems: newItems,
    };
  });
};
