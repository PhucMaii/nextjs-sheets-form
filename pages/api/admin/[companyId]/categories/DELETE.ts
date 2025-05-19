import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  categoryId: number;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { categoryId }: IBody = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        error: 'Category Id Not Found',
      });
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return res.status(200).json({
      message: `Category ${existingCategory.name} Deleted Successfully`,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
