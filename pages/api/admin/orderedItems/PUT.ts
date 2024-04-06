import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      orderTotalPrice,
      isCreateNewCategory,
      categoryName,
    } = updatedData;

    // Update in order items
    // for (const item of updatedItems) {
    //   await prisma.orderedItems.update({
    //     where: {
    //       id: item.id,
    //     },
    //     data: {
    //       price: item.price,
    //       quantity: item.quantity
    //     },
    //   });
    // }
    await prisma.orderedItems.updateMany({
      data: [...updatedItems],
    });

    await updateOrderTotalPrice(orderId, orderTotalPrice);

    if (!isCreateNewCategory) {
      return res.status(200).json({
        message: 'Update Data Successfully',
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryName,
      },
    });

    const formatUpdatedItems = updatedItems.map((item: any) => {
      return { name: item.name, price: item.price, category: newCategory.id };
    });

    // create new items
    const newItems = await prisma.item.createMany({
      data: [...formatUpdatedItems],
    });

    return res.status(200).json({
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
