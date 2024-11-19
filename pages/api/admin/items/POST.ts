import { IItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
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
        price: newItem.price,
        availability: newItem?.availability || true,
        inventoryItemId: newItem?.inventoryItemId || null,
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
  console.log(newItem, 'new item')
  try {
    const prisma = new PrismaClient();

    // * BAD CASE
    // Check is new name valid
    let inventoryItemExists: any = [];
    if (newItem.inventoryItemId) {
      inventoryItemExists = await prisma.item.findMany({
        where: {
          categoryId: newItem.categoryId,
          inventoryItemId: newItem?.inventoryItemId,
        },
      });
    } else {
      inventoryItemExists = await prisma.item.findMany({
        where: {
          categoryId: newItem.categoryId,
          name: newItem.name,
        },
      });
    }

    if (inventoryItemExists.length > 0) {
      return { check: false, message: 'Inventory Item Already Existed' };
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
