// import { websiteItemCategoryId } from '@/app/lib/constant';
import { websiteItemCategoryId } from '@/app/lib/constant';
import { calculateQtyLeft } from '@/pages/api/utils/items';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  inventoryItemId?: string;
  categoryId?: string;
  all?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { inventoryItemId, categoryId, all } = req.query as IQuery;
    const { companyId } = req.query;

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
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
      });

      const items = await prisma.item.findMany({
        where: {
          categoryId: Number(categoryId),
        },
        include: {
          options: {
            include: {
              unit: true,
              item: true,
            },
          },
          inventoryUnit: true,
          inventoryItem: {
            include: {
              vendorItem: {
                include: {
                  unit: true,
                  fifo: true,
                },
              },
              type: true,
              // type: {
              //   include: {
              //     itemType_category: true,
              //   },
              // },
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
      });

      const returnedItems = [...items].sort((a: any, b: any) => {
        const aTypePriority = a?.inventoryItem?.type?.priority ?? Infinity;
        const bTypePriority = b?.inventoryItem?.type?.priority ?? Infinity;

        if (aTypePriority !== bTypePriority) {
          return aTypePriority - bTypePriority;
        }

        const aIndex = a?.inventoryItem?.indexPos ?? Infinity;
        const bIndex = b?.inventoryItem?.indexPos ?? Infinity;

        return aIndex - bIndex;
      });

      const itemsWithQtyLeft = returnedItems.map((item: any) => {
        const qtyLeft = calculateQtyLeft(item);
        return { ...item, qtyLeft };
      });

      return res.status(200).json({
        data: { ...category, items: itemsWithQtyLeft },
        message: 'Fetch Category Successfully',
      });
    }

    if (inventoryItemId) {
      const categories = await prisma.category.findMany({
        where: {
          items: {
            some: {
              inventoryItemId: Number(inventoryItemId),
            },
          },
          id: {
            not: websiteItemCategoryId,
          },
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
        id:
          all === 'true'
            ? undefined
            : {
                not: websiteItemCategoryId,
              },
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
