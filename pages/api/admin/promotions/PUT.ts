import { PROMOTION_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  status?: PROMOTION_STATUS;
  title?: string;
  itemIds?: number[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, status, title, itemIds }: IBody = req.body;

    const existingPromotion = await prisma.promotion.findUnique({
      where: {
        id: id,
      },
      include: {
        items: true,
      },
    });

    if (!existingPromotion) {
      return res.status(404).json({
        error: 'Promotion Not Found',
      });
    }

    // Detect is there any change
    const fieldsToUpdate: any = {};
    if (status && status !== existingPromotion.status) {
      fieldsToUpdate.status = status;
    }

    if (title && title !== existingPromotion.title) {
      fieldsToUpdate.title = title;
    }

    if (Object.keys(fieldsToUpdate).length > 0) {
      await prisma.promotion.update({
        where: {
          id: id,
        },
        data: fieldsToUpdate,
      });
    }

    const existingItemIds = existingPromotion.items.map((item: any) => item.id);
    if (itemIds && JSON.stringify(itemIds) !== JSON.stringify(existingItemIds)) {
      // Get new items
      const newItemIds = itemIds.filter(
        (id: number) => !existingItemIds.includes(id),
      );
      const removedItemIds = existingItemIds.filter(
        (id: number) => !itemIds.includes(id),
      );

      // Attach items to promotion
      await prisma.inventoryItem.updateMany({
        where: {
          id: {
            in: newItemIds,
          },
        },
        data: {
          promotionId: id,
        },
      });

      // Remove items from promotion
      await prisma.inventoryItem.updateMany({
        where: {
          id: {
            in: removedItemIds,
          },
        },
        data: {
          promotionId: null,
        },
      });
    }

    return res.status(200).json({
      data: existingPromotion,
      message: 'Update Promotion Successfully',
    });
  } catch (error: any) {
    console.log('There was an error: ', error);
    return res.status(500).json({ error: 'There was an error: ' + error });
  }
}
