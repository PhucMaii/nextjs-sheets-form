import { getUserInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { inventoryItemId, categories, updatedOptions } = req.body;

    if (!categories) {
      return res.status(400).json({ error: 'Categories are required' });
    }

    const categoryIds = categories.map((category: any) => category.id);

    const items = await prisma.item.findMany({
      where: {
        inventoryItemId,
        categoryId: {
          in: categoryIds,
        },
      },
      include: {
        options: true,
      },
    });

    // // Cached all old options
    // const optionRelated = await prisma.option.findMany({
    //     where: {
    //         itemId: {
    //             in: items.map((item: any) => item.id),
    //         },
    //     },
    // });

    // Delete old options
    await prisma.option.deleteMany({
      where: {
        itemId: {
          in: items.map((item: any) => item.id),
        },
      },
    });

    // Create new options
    // Each loop -> create new updated options for each item
    const today = getTodayDate();
    const admin: any = await getUserInfo(req, res);
    const promiseOptions = items.map((item: any) => {
      return prisma.option.createMany({
        data: updatedOptions.map((option: any) => {
          return {
            name: option.name,
            price: option.price,
            availability: option.availability,
            unitId: Number(option.unitId),
            createdAt: today.dateAndTime,
            createdBy: `Admin - ${admin.clientName}`,
            prevPrice: option?.prevPrice,
            isShowDiscount: option?.isShowDiscount,
            inventoryItemId: item.inventoryItemId,
            itemId: item.id,
          };
        }),
      });
    });

    await Promise.all(promiseOptions);

    return res.status(200).json({ message: 'Success' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
