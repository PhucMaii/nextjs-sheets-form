import { PROMOTION_STATUS } from '@/app/utils/enum';
import { getTodayDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface IBody {
  title: string;
  status: PROMOTION_STATUS;
  itemIds: number[]; // item ids in website category
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, status, itemIds }: IBody = req.body;

    const today = getTodayDate();

    const newPromotion = await prisma.promotion.create({
      data: {
        title,
        status,
        visibility: true,
        isWebsite: true,
        createdAt: today.dateAndTime,
        rows: 1,
        priority: 0,
      },
    });

    await prisma.item.updateMany({
      where: {
        id: {
          in: itemIds,
        },
      },
      data: {
        promotionId: newPromotion.id,
      },
    });

    return res.status(200).json({ message: 'Promotion created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}