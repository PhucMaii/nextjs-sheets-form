// import { websiteItemCategoryId } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  inventoryItemId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { inventoryItemId } = req.query as IQuery;
    const { companyId } = req.query;

    if (inventoryItemId) {
      const categories = await prisma.category.findMany({
        where: {
          items: {
            some: {
              inventoryItemId: Number(inventoryItemId),
            },
          },
          // id: {
          //   not: websiteItemCategoryId,
          // },
        },
        include: {
          users: true,
          items: {
            include: {
              options: {
                include: {
                  unit: true,
                  item: true,
                },
              },
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
        orderBy: {
          name: 'asc',
        },
      });

      return res.status(200).json({
        data: categories,
        message: 'Fetch All Categories Successfully',
      });
    }

    // Get all categories - not including website categories
    const categories = await prisma.category.findMany({
      where: {
        companyId: Number(companyId),
        // id: {
        //   not: websiteItemCategoryId,
        // },
      },
      include: {
        users: true,
        items: {
          include: {
            options: {
              include: {
                unit: true,
                item: true,
              },
            },
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
      orderBy: {
        name: 'asc',
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
