import { Item, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  updatedItem: Item;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { updatedItem }: IBody = req.body;

    if (
      !updatedItem.id ||
      !updatedItem ||
      Object.keys(updatedItem).length === 0
    ) {
      return res.status(404).json({
        error: 'Missing either item id or updated item data',
      });
    }

    const existingItem = await prisma.item.findUnique({
      where: {
        id: updatedItem.id,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        error: 'Invalid item id',
      });
    }

    // * BAD CASE
    if (
      !updatedItem.name.includes('BEAN') &&
      existingItem.name !== updatedItem.name
    ) {
      // Check is new name valid
      const itemSameName = await prisma.item.findMany({
        where: {
          name: updatedItem.name,
          categoryId: updatedItem.categoryId,
        },
      });

      if (itemSameName.length > 0) {
        return res.status(500).json({
          error: 'Item Name Already Existed',
        });
      }
    }

    // * BAD CASE
    // If updated item is beansprouts => check is subcategory id valid
    if (updatedItem.name.includes('BEAN')) {
      if (!updatedItem.subCategoryId) {
        return res.status(404).json({
          error: 'Subcategory required if item is beansprouts',
        });
      }

      const itemSameNameAndSubCategory = await prisma.item.findMany({
        where: {
          name: updatedItem.name,
          categoryId: updatedItem.categoryId,
          subCategoryId: updatedItem.subCategoryId,
        },
      });

      if (itemSameNameAndSubCategory.length !== 0) {
        const isNotValid = itemSameNameAndSubCategory.some(
          (item: Item) => item.id !== updatedItem.id,
        );

        if (isNotValid) {
          return res.status(500).json({
            error: `Item with name ${updatedItem.name} and subcategory id ${updatedItem.subCategoryId} existed already`,
          });
        }
      }
    }

    const newUpdatedItem = await prisma.item.update({
      where: {
        id: updatedItem.id,
      },
      data: {
        name: updatedItem.name,
        price: updatedItem.price,
        categoryId: updatedItem.categoryId,
        subCategoryId:
          updatedItem.subCategoryId && updatedItem.subCategoryId > 0
            ? updatedItem.subCategoryId
            : null,
      },
      include: {
        subCategory: true,
      },
    });

    return res.status(200).json({
      data: newUpdatedItem,
      message: 'Item Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
