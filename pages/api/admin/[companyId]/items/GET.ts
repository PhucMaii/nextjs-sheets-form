import { testItemId } from '@/app/lib/constant';
import { calculateQtyLeft } from '@/pages/api/utils/items';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  categoryId?: string;
  userId?: string;
  itemId?: string;
  inventoryItemId?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { itemId, categoryId, userId, inventoryItemId, companyId }: IQuery =
      req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    if (itemId) {
      const item = await prisma.item.findUnique({
        where: {
          id: Number(itemId),
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
              fifo: true,
              type: true,
              item: {
                include: {
                  category: true,
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
      });

      // Fetching listing categories
      const sellingItemWithThisInventory = await prisma.item.findMany({
        where: {
          inventoryItemId: item?.inventoryItemId,
        },
        include: {
          category: true,
          options: true,
        },
      });

      const currentCost = item?.inventoryItem?.fifo[0]?.price || 0;

      const itemPrice =
        item?.options?.reduce(
          (acc: number, option: any) => acc + option.price,
          0,
        ) || item?.price;
      const profit = (itemPrice || 0) - currentCost;
      // Round to 2 decimal places

      const margin = (profit / currentCost) * 100;
      const formattedMargin = Math.round(margin * 100) / 100;

      const sellignItemsWithProfit = sellingItemWithThisInventory.map(
        (item: any) => {
          const itemPrice = item?.price;
          const profit = (itemPrice || 0) - currentCost;
          return { ...item, profit };
        },
      );

      return res.status(200).json({
        data: {
          ...item,
          listingCategories: sellignItemsWithProfit,
          costPerItem: currentCost,
          profit,
          margin: formattedMargin,
        },
      });
    }

    if (categoryId) {
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
        // orderBy: [
        //   { inventoryItem: { type: { priority: 'asc' } } }, // Order by type priority first
        //   { inventoryItem: { indexPos: 'asc' } }, // Then by indexPos
        // ],
      });

      const returnedItems = items.sort((a: any, b: any) => {
        const typePriorityDiff =
          a?.inventoryItem?.type?.priority - b?.inventoryItem?.type?.priority;

        if (typePriorityDiff !== 0) {
          return typePriorityDiff;
        }

        return a.inventoryItem.indexPos - b.inventoryItem.indexPos;
      });

      const itemsWithQtyLeft = returnedItems.map((item: any) => {
        const qtyLeft = calculateQtyLeft(item);
        return { ...item, qtyLeft };
      });

      return res.status(200).json({
        data: itemsWithQtyLeft,
        message: 'Fetch Items Successfully',
      });
    }

    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(userId),
          companyId: Number(companyId),
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
          companyId: Number(companyId),
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
            where: {
              id: {
                not: testItemId,
              },
            },
            include: {
              vendorItem: {
                include: {
                  unit: true,
                  fifo: true,
                },
              },
              type: true,
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
        orderBy: [
          { inventoryItem: { type: { priority: 'asc' } } }, // Order by type priority first
          { inventoryItem: { indexPos: 'asc' } }, // Then by indexPos
        ],
      });

      const itemsWithQtyLeft = items.map((item: any) => {
        const qtyLeft = calculateQtyLeft(item);
        return { ...item, qtyLeft };
      });

      return res.status(200).json({
        data: itemsWithQtyLeft,
        message: 'Fetch Items Successfully',
      });
    }

    if (inventoryItemId) {
      const items = await prisma.item.findMany({
        where: {
          inventoryItemId: Number(inventoryItemId),
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

      // Sort by category name
      const sortedItems = items.sort((a: any, b: any) => {
        if (a?.category?.name < b?.category?.name) {
          return -1;
        }
        if (a?.category?.name > b?.category?.name) {
          return 1;
        }
        return 0;
      });

      return res.status(200).json({
        data: sortedItems,
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
