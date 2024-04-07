import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface UpdatedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  orderId: number;
}

interface BodyType {
  orderId: number;
  updatedItems: UpdatedItem[];
  orderTotalPrice: number;
  isCreateNewCategory?: boolean;
  isUpdateCategoryPrice?: boolean;
  categoryName: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      orderTotalPrice,
      isCreateNewCategory,
      isUpdateCategoryPrice,
      categoryName,
    } = updatedData as BodyType;

    await prisma.orderedItems.updateMany({
      where: {
        orderId
      },
      data: [...updatedItems],
    });

    await updateOrderTotalPrice(orderId, orderTotalPrice);

    // First case: No update neither create new category
    if (!isCreateNewCategory && !isUpdateCategoryPrice) {
      return res.status(200).json({
        message: 'Update Data Successfully',
      });
    }

    if (isCreateNewCategory) {

    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryName,
      },
    });

    const formatUpdatedItems = updatedItems.map(
      (
        item: UpdatedItem,
      ): { name: string; price: number; categoryId: number } => {
        return {
          name: item.name,
          price: item.price,
          categoryId: newCategory.id,
        };
      },
    );

    // create new items
    const newItems = await prisma.item.createMany({
      data: [...formatUpdatedItems],
    });

    // assign client to new categoryId
    

    return res.status(200).json({
      data: newItems,
      message: 'New Category Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
}

const updateOrderTotalPrice = async (
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
