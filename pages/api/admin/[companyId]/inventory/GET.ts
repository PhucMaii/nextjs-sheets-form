import { inventoryOrder } from '@/app/lib/constant';
import { sortedItemKeys } from '@/app/utils/array';
import { STOCK_STATUS } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  vendorId?: string;
  inventoryItemId?: string;
  companyId?: string;
  isInternal?: string;
  includedInternal?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { vendorId, inventoryItemId, companyId, isInternal, includedInternal }: IQuery =
      req.query;

    if (vendorId) {
      const vendorItems = await prisma.vendorItem.findMany({
        where: {
          vendorId: Number(vendorId),
        },
        include: {
          inventoryItem: {
            include: {
              vendorItem: {
                include: {
                  vendor: true,
                  fifo: true,
                  unit: true,
                },
              },
              type: true,
              subtractRules: {
                include: {
                  dependentInventoryItem: true,
                },
              },
            },
          },
        },
      });

      const formattedInventory: any[] = [];

      for (const vendorItem of vendorItems) {
        const existingInventoryItem = formattedInventory.find(
          (item: any) => item.id === vendorItem.inventoryItemId,
        );

        if (existingInventoryItem) {
          continue;
        }

        const formattedItem = formatInventoryWithTotalValueAndStatus([
          vendorItem.inventoryItem,
        ]);
        formattedInventory.push(...formattedItem);
      }

      return res.status(200).json({
        data: formattedInventory,
        message: 'Fetch Inventory Successfully',
      });
    }

    if (inventoryItemId) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: {
          id: Number(inventoryItemId),
        },
        include: {
          subtractRules: {
            include: {
              dependentInventoryItem: true,
            },
          },
          fifo: {
            include: {
              vendorItem: {
                include: {
                  vendor: true,
                },
              },
            },
          },
          vendorItem: {
            include: {
              vendor: true,
              fifo: true,
              unit: true,
            },
          },
          item: {
            include: {
              category: true,
              inventoryUnit: true,
              options: {
                include: {
                  unit: true,
                },
              },
            },
          },
          type: true,
        },
      });

      if (!inventoryItem) {
        return res.status(404).json({ error: 'Inventory Item not found' });
      }

      const formattedInventory = formatInventoryWithTotalValueAndStatus([
        inventoryItem,
      ]);

      // let sellingUnits = inventoryItem.vendorItem.flatMap(
      //   (item: any) => item.unit,
      // );

      // sellingUnits = Array.from(
      //   new Map(sellingUnits.map((unit: any) => [unit.ratio, unit])).values(),
      // );

      const vendorItemWithListOfUnits = inventoryItem.vendorItem.map(
        (item: any) => ({
          ...item,
          name: item.vendor.name,
          id: item.vendor.id, // use id as vendor id to match with front end
          vendorItemId: item.id,
          supplierSku: item?.supplierSku || '',
          units: item.unit,
        }),
      );

      // Format item to match with InventoryTemplate
      const formattedItem = {
        ...formattedInventory[0],
        vendorItem: vendorItemWithListOfUnits,
        sellingItems: inventoryItem.item.map((item: any) => ({
          ...item,
          id: item.categoryId || 0,
          itemId: item.id,
          isItem: true,
        })),
      };

      return res.status(200).json({
        data: formattedItem,
        message: 'Fetch Inventory Successfully',
      });
    }

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const internalQuery = isInternal ? { isInternal: true } : !includedInternal ? { OR: [{ isInternal: null }, { isInternal: false }] } : {};

    const inventory: any = await prisma.inventoryItem.findMany({
      where: {
        companyId: Number(companyId),
        ...internalQuery,
      },
      include: {
        subtractRules: {
          include: {
            dependentInventoryItem: true,
          },
        },
        fifo: {
          include: {
            vendorItem: {
              include: {
                vendor: true,
              },
            },
          },
        },
        vendorItem: {
          include: {
            vendor: true,
            fifo: true,
            unit: true,
          },
        },
        type: true,
        item: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        indexPos: 'asc',
      },
    });

    const formattedInventory =
      formatInventoryWithTotalValueAndStatus(inventory);

    const itemNames = formattedInventory.map((item: any) => item.name);

    const sortedItems = sortedItemKeys(itemNames, inventoryOrder);

    const sortedInventoryItem = [];
    for (const item of sortedItems) {
      const inventoryItem: any = formattedInventory.find(
        (i: any) => i.name === item,
      );

      const listingCategories = inventoryItem?.item?.map(
        (item: any) => item.category.name,
      );

      if (inventoryItem) {
        sortedInventoryItem.push({ ...inventoryItem, listingCategories });
      }
    }

    const types = await prisma.itemType.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        inventoryItems: {
          include: {
            vendorItem: {
              include: {
                vendor: true,
              },
            },
          },
          orderBy: {
            indexPos: 'asc',
          },
        },
      },
      orderBy: {
        priority: 'asc',
      },
    });

    // const listingCategories = listingItems.map((item: any) => item.category.name);

    return res.status(200).json({
      data: sortedInventoryItem,
      types,
      // listingItems: listingCategories,
      message: 'Fetch Inventory Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

export const formatInventoryWithTotalValueAndStatus = (
  inventoryItems: any[],
) => {
  const newInventoryItems = inventoryItems.map(
    (inventoryItem: IInventoryItem) => {
      let quantity = 0;
      let totalValue = 0;

      for (const vendorItem of inventoryItem.vendorItem) {
        const quantityAndValue =
          vendorItem?.fifo?.reduce((acc: any, fifo: any) => {
            const baseUnit = vendorItem.unit.find(
              (unit: any) => unit.ratio === 1,
            );

            if (!acc.totalQuantity) {
              acc.totalQuantity = fifo.quantity;
            } else {
              acc.totalQuantity += fifo.quantity;
            }

            if (!acc.totalValue) {
              acc.totalValue = fifo.quantity * baseUnit?.unitPrice || 0;
            } else {
              acc.totalValue += fifo.quantity * baseUnit?.unitPrice || 0;
            }

            return acc;
          }, {}) || {};

        quantity += quantityAndValue?.totalQuantity || 0;
        totalValue += quantityAndValue?.totalValue || 0;
      }

      let status = STOCK_STATUS.OUT_OF_STOCK;
      if (quantity === 0) {
        status = STOCK_STATUS.OUT_OF_STOCK;
      } else if (quantity < 10) {
        status = STOCK_STATUS.LOW_STOCK;
      } else {
        status = STOCK_STATUS.IN_STOCK;
      }

      return {
        ...inventoryItem,
        totalValue,
        quantity,
        stockStatus: status,
      };
    },
  );

  return newInventoryItems;
};
