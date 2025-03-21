import { PROMOTION_STATUS } from '@/app/utils/enum';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
    activePromotionIds: number[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(400).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { activePromotionIds }: IBody = req.body;

    if (!activePromotionIds) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const dbActivePromotions = await prisma.promotion.findMany({
      where: {
        status: PROMOTION_STATUS.ACTIVE,
      },
    });

    // Convert to array of ids for easy compare
    const dbActivePromotionIds = dbActivePromotions.map(
      (promotion) => promotion.id,
    );

    // If there is any change -> update
    if (
      JSON.stringify(activePromotionIds) !==
      JSON.stringify(dbActivePromotionIds)
    ) {
      // Get promotions set back to inactive
      const updatedInactivePromotionIds = dbActivePromotionIds.filter(
        (promotionId: number) => !activePromotionIds.includes(promotionId),
      );

      if (updatedInactivePromotionIds.length > 0) {
        await prisma.promotion.updateMany({
          where: {
            id: {
              in: updatedInactivePromotionIds
            },
          },
          data: {
            status: PROMOTION_STATUS.INACTIVE,
          },
        });
      }

      // Update the activePromotionIds provided by client side
      await prisma.promotion.updateMany({
        where: {
          id: {
            in: activePromotionIds,
          },
        },
        data: {
          status: PROMOTION_STATUS.ACTIVE,
        },
      });
    }

    return res.status(200).json({ message: 'Update Promotion Status Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);