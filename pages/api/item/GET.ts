import { Item, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'You are not authenticated' });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    let items: any = [];
    if (existingUser?.subCategoryId) {
      items = await fetchItemsWithSubCategoryId(
        existingUser.subCategoryId,
        existingUser.categoryId,
      );
    } else {
      items = await prisma.item.findMany({
        where: {
          categoryId: existingUser?.categoryId,
        },
      });
    }

    return res.status(200).json({
      data: { items, clientName: existingUser?.clientName },
      message: 'Fetch Items Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const fetchItemsWithSubCategoryId = async (
  subCategoryId: number,
  categoryId: number,
) => {
  try {
    const prisma = new PrismaClient();

    const beansprouts = await prisma.item.findMany({
      where: {
        categoryId,
        subCategoryId,
      },
    });

    const otherItems = await prisma.item.findMany({
      where: {
        categoryId,
      },
    });

    // ensure there's no beansprouts left here
    const removeDuplicatedItems = otherItems.filter((targetItem: Item) => {
      return !targetItem.subCategoryId;
    });

    return [...beansprouts, ...removeDuplicatedItems];
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};
