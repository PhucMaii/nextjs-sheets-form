import { Category, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  updatedCategory: Category;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { updatedCategory }: IBody = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: updatedCategory.id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        error: 'Category Id Not Found',
      });
    }

    if (existingCategory.name === updatedCategory.name) {
      return res.status(400).json({
        error: 'New Name Does Not Change',
      });
    }

    const sameNameCategory = await prisma.category.findUnique({
      where: {
        name: updatedCategory.name,
      },
    });

    if (sameNameCategory) {
      return res.status(400).json({
        error: 'Category Name Existed Already',
      });
    }

    const newNameCategory = await prisma.category.update({
      where: {
        id: updatedCategory.id,
      },
      data: {
        name: updatedCategory.name,
      },
      include: {
        users: true,
        items: true,
      },
    });

    return res.status(200).json({
      data: newNameCategory,
      message: 'Category Name Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
