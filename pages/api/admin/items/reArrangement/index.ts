import { IItem } from '@/app/utils/type';
import { Item, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  removedItemIdList: number[];
  updatedItemList: IItem[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'PUT') {
      return res.status(400).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const { removedItemIdList, updatedItemList }: IBody = req.body;

    // Remove all the item related in that category
    // for (const id of removedItemIdList) {
    //   await prisma.item.delete({
    //     where: {
    //       id,
    //     },
    //   });
    // }
    await prisma.item.deleteMany({
        where: {
            id: {
                in: removedItemIdList
            }
        }
    })

    const formattedNewItems = updatedItemList.map((item: IItem): Item => {
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            availability: item.availability,
            categoryId: item.categoryId,
            subCategoryId: item?.subCategoryId || null,
        }
    });

    await prisma.item.createMany({
        data: formattedNewItems,
    });

    return res.status(200).json({
        message: 'Item Rearrange Succesfully'
    })
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
