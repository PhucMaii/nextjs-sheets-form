import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface UpdatedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  orderId: number;
}

export enum UpdateOption {
  NONE = 'none',
  CREATE = 'create',
  UPDATE = 'update',
}

interface BodyType {
  orderId: number;
  updatedItems: UpdatedItem[];
  orderTotalPrice: number;
  updateOption?: UpdateOption;
  categoryName?: string;
  userId?: number;
  userCategoryId?: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      orderTotalPrice,
      updateOption,
      categoryName,
      userId,
      userCategoryId,
    } = updatedData as BodyType;
    console.log(updatedData, 'updatedData');

    for (const item of updatedItems) {
      await prisma.orderedItems.update({
        where: {
          id: item.id,
        },
        data: {
          price: item.price,
          quantity: item.quantity,
        },
      });
    }

    await updateOrderTotalPrice(orderId, orderTotalPrice);

    // First case: No update neither create new category
    if (updateOption === UpdateOption.NONE || !updateOption) {
      return res.status(200).json({
        message: 'Update Data Successfully',
      });
    }

    // Second case: if user want ot create new category
    if (updateOption === UpdateOption.CREATE) {
      const newCategory = await prisma.category.create({
        data: {
          name: categoryName ? categoryName : '',
        },
      });

      const formattedUpdatedItems = formatUpdatedItems(
        newCategory.id,
        updatedItems,
      );

      // create new items
      const newItems = await prisma.item.createMany({
        data: [...formattedUpdatedItems],
      });

      // assign client to new categoryId
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          categoryId: newCategory.id,
        },
      });

      return res.status(200).json({
        data: newItems,
        message: 'New Category Created Successfully',
      });
    }

    // last case: if user want to update category price
    if (updateOption === UpdateOption.UPDATE) {
      for (const item of updatedItems) {
        await prisma.item.updateMany({
          where: {
            name: item.name,
            categoryId: userCategoryId,
          },
          data: {
            price: item.price,
          },
        });
      }

      return res.status(200).json({
        message: 'Category Price Updated Succesfully',
      });
    }
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const updateOrderTotalPrice = async (
  orderId: number,
  newTotalPrice: number,
) => {
  try {
    const prisma = new PrismaClient();

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: newTotalPrice,
      },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

const formatUpdatedItems = (categoryId: number = 0, updatedItems: any) => {
  const formattedUpdatedItems = updatedItems.map(
    (
      item: UpdatedItem,
    ): { name: string; price: number; categoryId: number } => {
      return {
        name: item.name,
        price: item.price,
        categoryId: categoryId,
      };
    },
  );

  return formattedUpdatedItems;
};
