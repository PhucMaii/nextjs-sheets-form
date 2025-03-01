import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  categoryId?: string;
  userId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { categoryId, userId }: IQuery = req.query;

    if (categoryId) {
      const items = await prisma.item.findMany({
        where: {
          categoryId: Number(categoryId),
        },
        include: {
          inventoryUnit: true,
          inventoryItem: {
            include: {
              vendorItem: {
                include: {
                  unit: true,
                },
              },
              type: true,
            },
          },
        },
      });
      return res.status(200).json({
        data: items,
        message: 'Fetch Items Successfully',
      });
    }

    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'User Not Found',
        });
      }

      const items = await prisma.item.findMany({
        where: {
          categoryId: existingUser?.categoryId || 0,
        },
        include: {
          inventoryUnit: true,
          inventoryItem: {
            include: {
              vendorItem: {
                include: {
                  unit: true,
                },
              },
              type: true,
            },
          },
        },
      });

      return res.status(200).json({
        data: items,
        message: 'Fetch Items Successfully',
      });
    }

    return res.status(404).json({
      error: 'No provided information',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
