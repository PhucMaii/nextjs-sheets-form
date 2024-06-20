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

    const isItemValid: any = await checkIsItemValid(newItem);

    if (!isItemValid.check) {
      return res.status(500).json({
        error: isItemValid.message,
      });
    }

    const createdItem = await prisma.item.create({
      data: {
        name: newItem.name,
        categoryId: newItem.categoryId,
        subCategoryId:
          newItem.subCategoryId && newItem.subCategoryId > 0
            ? newItem.subCategoryId
            : null,
        price: newItem.price,
      },
      include: {
        subCategory: true,
      },
    });

    return res.status(201).json({
      data: createdItem,
      message: 'Item Created Succesfully',
    });
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
        return { check: false, message: 'Item Name Already Existed' };
      }
    }

    // * BAD CASE
    // If updated item is beansprouts => check is subcategory id valid
    if (newItem.name.includes('BEAN')) {
      if (!newItem.subCategoryId) {
        return {
          check: false,
          message: 'Subcategory required if item is beansprouts',
        };
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
          return {
            check: false,
            message: `Item with name ${newItem.name} and subcategory id ${newItem.subCategoryId} existed already`,
          };
        }
      }
    }

    return { check: true };
  } catch (error: any) {
    console.log('Internal Server Error in checking item: ', error);
    return {
      check: false,
      message: 'Internal SServer Error in checking item: ' + error,
    };
  }
};
