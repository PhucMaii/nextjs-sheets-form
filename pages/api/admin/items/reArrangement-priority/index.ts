import { IItem } from '@/app/utils/type';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  removedItemIdList: number[];
  updatedItemList: IItem[];
  typeId?: number;
  categoryId?: number;
  priority?: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(400).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const {
      removedItemIdList,
      updatedItemList,
      priority,
      typeId,
      categoryId,
    }: IBody = req.body;

    // Update itemType_category priority
    console.log({
      priority,
      typeId,
      categoryId,
    });
    if (priority && typeId && categoryId) {
      // Find if the itemType_category exist
      const existingItemTypeCategory =
        await prisma.itemType_Category.findUnique({
          where: {
            itemTypeId_categoryId: {
              itemTypeId: typeId,
              categoryId,
            },
          },
        });

      if (!existingItemTypeCategory) {
        // Create itemType_category
        await prisma.itemType_Category.create({
          data: {
            itemTypeId: typeId,
            categoryId,
            priority,
          },
        });
      } else {
        if (existingItemTypeCategory.priority !== priority) {
          // Update itemType_category
          await prisma.itemType_Category.update({
            where: {
              itemTypeId_categoryId: {
                itemTypeId: typeId,
                categoryId,
              },
            },
            data: {
              priority,
            },
          });
        }
      }
    }

    await prisma.item.deleteMany({
      where: {
        id: {
          in: removedItemIdList,
        },
      },
    });

    const formattedNewItems = updatedItemList.map((item: IItem): any => {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        availability: item.availability,
        prevPrice: item?.prevPrice,
        isShowDiscount: item?.isShowDiscount,
        categoryId: item.categoryId,
        inventoryItemId: item?.inventoryItemId,
        inventoryUnitId: item?.inventoryUnitId,
      };
    });

    await prisma.item.createMany({
      data: formattedNewItems,
    });

    return res.status(200).json({
      message: 'Item Rearrange Succesfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
