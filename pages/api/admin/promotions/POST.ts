import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import { PROMOTION_STATUS } from '@/app/utils/enum';

interface IBody {
  title: string;
  status: PROMOTION_STATUS;
  itemIds: number[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { title, status, itemIds }: IBody = req.body;

    // Check is the title existed
    const isTitleExisted = await prisma.promotion.findFirst({
      where: {
        title,
        isWebsite: null
      },
    });

    if (isTitleExisted) {
      return res.status(500).json({ error: 'Promotion Title Existed' });
    }

    const createdAt = getTodayDate();

    // Get the next priority
    const allPromotions = await prisma.promotion.findMany({
      where: {
        isWebsite: null
      },
      orderBy: {
        priority: 'desc',
      },
    });

    const nextPriority = allPromotions[0]?.priority
      ? allPromotions[0]?.priority + 1
      : 1;
    const newPromotion = await prisma.promotion.create({
      data: {
        title,
        status,
        createdAt: createdAt.dateAndTime,
        rows: 1,
        priority: nextPriority,
        visibility: false,
      },
    });

    // Attach items to promotion
    await prisma.inventoryItem.updateMany({
      where: {
        id: {
          in: itemIds,
        },
      },
      data: {
        promotionId: newPromotion.id,
      },
    });

    return res.status(200).json({
      message: 'Promotion Created Successfully',
      data: newPromotion,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
