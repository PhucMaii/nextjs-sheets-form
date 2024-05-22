import { Item, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  categoryId?: string;
  subCategoryId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { categoryId, subCategoryId } = req.query as RequestQuery;

    const fetchCondition: any = {categoryId: Number(categoryId)};

    if (subCategoryId) {
      fetchCondition.subCategoryId = Number(subCategoryId);
    }

    // only get beansprout
    const beansprouts = await prisma.item.findMany({
      where: fetchCondition
    });

    // get the rest of items
    const otherItems = await prisma.item.findMany({
      where: {
        categoryId: Number(categoryId)
      }
    });

    const removeDuplicatedItems = otherItems.filter((targetItem: Item) => {
      return !targetItem.subCategoryId
    })

    const clientItems = [...beansprouts, ...removeDuplicatedItems];

    return res.status(200).json({
      data: clientItems,
      message: 'Fetch Items For Specific Client Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
