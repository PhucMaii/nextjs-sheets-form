import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { PROMOTION_STATUS } from '@/app/utils/enum';
import prisma from '@/client';

interface IBody {
  title: string;
  status: PROMOTION_STATUS;
  itemIds: number[];
}

interface IQuery {
  companyId?: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, status, itemIds }: IBody = req.body;

    const { companyId } = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required',
      });
    }

    // Check is the title existed
    const isTitleExisted = await prisma.promotion.findFirst({
      where: {
        title,
        isWebsite: null,
        companyId: Number(companyId),
      },
    });

    if (isTitleExisted) {
      return res.status(500).json({ error: 'Promotion Title Existed' });
    }

    const createdAt = getTodayDate();

    // Get the next priority
    const allPromotions = await prisma.promotion.findMany({
      where: {
        isWebsite: null,
        companyId: Number(companyId),
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
        companyId: Number(companyId),
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
