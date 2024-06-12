import { IItem } from '@/app/utils/type';
import { Item, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  newItem: IItem;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { newItem }: IBody = req.body;
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

const checkIsItemValid = async (newItem: IItem) => {
  try {
    const prisma = new PrismaClient();

    // * BAD CASE
    if (!newItem.name.includes('BEAN')) {
      // Check is new name valid
      const itemSameName = await prisma.item.findMany({
        where: {
          name: newItem.name,
          categoryId: newItem.categoryId,
        },
      });

      if (itemSameName.length > 0) {
        // return res.status(500).json({
        //   error: 'Item Name Already Existed',
        // });
        return { check: false, message: 'Item Name Already Existed'}
      }
    }

    // * BAD CASE
    // If updated item is beansprouts => check is subcategory id valid
    if (newItem.name.includes('BEAN')) {
      if (!newItem.subCategoryId) {
        // return res.status(404).json({
        //   error: 'Subcategory required if item is beansprouts',
        // });
        return { check: false, message: 'Subcategory required if item is beansprouts',}
      }

      const itemSameNameAndSubCategory = await prisma.item.findMany({
        where: {
          name: newItem.name,
          categoryId: newItem.categoryId,
          subCategoryId: newItem.subCategoryId,
        },
      });

      if (itemSameNameAndSubCategory.length !== 0) {
        const isNotValid = itemSameNameAndSubCategory.some(
          (item: Item) => item.id !== newItem.id,
        );

        if (isNotValid) {
          return { check: false, message: `Item with name ${newItem.name} and subcategory id ${newItem.subCategoryId} existed already`}
        }
      }
    }

    return true;
  } catch (error: any) {
    console.log('Internal Server Error in checking item: ', error);
  }
};
