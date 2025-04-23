import { PROMOTION_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
  status?: PROMOTION_STATUS;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, status }: IQuery = req.query;

    if (id) {
      const promotion = await prisma.promotion.findUnique({
        where: {
          id: Number(id),
          isWebsite: false,
        },
        include: {
          items: {
            orderBy: {
              promoIndexPos: 'asc',
            },
          },
        },
      });

      if (!promotion) {
        return res.status(404).json({
          error: 'Promotion Not Found',
        });
      }

      return res.status(200).json({
        data: promotion,
        message: 'Fetch Promotion Successfully',
      });
    }

    if (status) {
      const promotions = await prisma.promotion.findMany({
        where: {
          status: status,
          isWebsite: false,
        },
        include: {
          items: true,
        },
        orderBy: {
          priority: 'asc',
        },
      });

      return res.status(200).json({
        data: promotions,
        message: 'Fetch Promotions Successfully',
      });
    }

    const allPromotions = await prisma.promotion.findMany({
      where: {
        isWebsite: false,
      },
      include: {
        items: {
          orderBy: {
            promoIndexPos: 'asc',
          },
        },
      },
      orderBy: {
        priority: 'asc',
      },
    });

    return res.status(200).json({
      data: allPromotions,
      message: 'Fetch All Promotions Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
