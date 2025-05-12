import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { categoryName } = req.body;
    const { companyId } = req.query;

    // Check if name existed
    const sameNameCategory = await prisma.category.findFirst({
      where: {
        name: categoryName,
        companyId: Number(companyId),
      },
    });

    if (sameNameCategory) {
      return res.status(500).json({
        error: 'Category Name Existed',
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryName,
        companyId: Number(companyId),
      },
    });

    return res.status(201).json({
      data: newCategory,
      message: 'Create New Category Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
