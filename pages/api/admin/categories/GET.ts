import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  inventoryItemId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { inventoryItemId } = req.query as IQuery;

    if (inventoryItemId) {
      const categories = await prisma.category.findMany({
        where: {
          items: {
            some: {
              inventoryItemId: Number(inventoryItemId),
            },
          },
        },
        include: {
          users: true,
          items: {
            include: {
              options: true,
              inventoryItem: {
                include: {
                  type: {
                    include: {
                      itemType_category: true,
                    },
                  },
                },
              },
              category: {
                include: {
                  itemType_category: {
                    include: {
                      itemType: true,
                    },
                  },
                },
              },
            },
          },
          itemType_category: {
            include: {
              itemType: true,
            },
          },
        },
      });

      return res.status(200).json(categories);
    }

    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        users: true,
        items: {
          include: {
            options: true,
            inventoryItem: {
              include: {
                type: {
                  include: {
                    itemType_category: true,
                  },
                },
              },
            },
            category: {
              include: {
                itemType_category: {
                  include: {
                    itemType: true,
                  },
                },
              },
            },
          },
        },
        itemType_category: {
          include: {
            itemType: true,
          },
        },
      },
    });

    return res.status(200).json({
      data: categories,
      message: 'Fetch All Categories Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
