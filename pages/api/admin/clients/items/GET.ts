import { fetchItemsWithSubCategoryId } from '@/pages/api/item/GET';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  categoryId?: string;
  subCategoryId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { categoryId, subCategoryId } = req.query as RequestQuery;

    let items: any = [];
    if (Number(subCategoryId)) {
      items = await fetchItemsWithSubCategoryId(
        Number(subCategoryId),
        Number(categoryId),
      );
    } else {
      items = await prisma.item.findMany({
        where: {
          categoryId: Number(categoryId),
        },
      });
    }

    return res.status(200).json({
      data: items,
      message: 'Fetch Items For Specific Client Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
