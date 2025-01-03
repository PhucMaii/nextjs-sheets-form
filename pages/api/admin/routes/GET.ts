import { PAYMENT_TYPE } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../utils/date';

interface QueryType {
  day?: string;
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { day, startDate, endDate }: QueryType = req.query;

    if (startDate && endDate) {
      const normalizedStartDate = normalizeDate(new Date(startDate));
      const normalizedEndDate = normalizeDate(new Date(endDate));

      const listOfDayStrings = generateListOfDateString(
        normalizedStartDate,
        normalizedEndDate,
      );

      const routes = await prisma.route.findMany({
        where: {
          day,
        },
        include: {
          driver: true,
          clients: {
            where: {
              user: {
                preference: {
                  paymentType: PAYMENT_TYPE.MONTHLY,
                },
              },
            },
            include: {
              user: {
                include: {
                  preference: true,
                  category: true,
                  subCategory: true,
                  routes: true,
                  Orders: {
                    where: {
                      deliveryDate: {
                        in: listOfDayStrings,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return res.status(200).json({
        data: routes,
        message: 'Fetch Routes Successfully',
      });
    }

    const routes: any = await prisma.route.findMany({
      where: {
        day,
      },
      include: {
        driver: true,
        clients: {
          include: {
            user: {
              include: {
                preference: true,
                category: true,
                subCategory: true,
                routes: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: routes,
      message: 'Fetch Routes Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
