import { inventoryOrder } from '@/app/lib/constant';
import { sortedItemKeys } from '@/app/utils/array';
import { STOCK_STATUS } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  vendorId?: string;
  inventoryItemId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { vendorId, inventoryItemId }: IQuery = req.query;

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
        },
      });

      if (!inventoryItem) {
        return res.status(404).json({ error: 'Inventory Item not found' });
      }

      const formattedInventory = formatInventoryWithTotalValueAndStatus([
        inventoryItem,
      ]);

      let sellingUnits = inventoryItem.vendorItem.flatMap(
        (item: any) => item.unit,
      );

      sellingUnits = Array.from(
        new Map(sellingUnits.map((unit: any) => [unit.ratio, unit])).values(),
      );

      return res.status(200).json({
        data: { ...formattedInventory, units: sellingUnits },
        message: 'Fetch Inventory Successfully',
      });
    }

    const inventory: any = await prisma.inventoryItem.findMany({
      include: {
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
      },
      orderBy: {
        indexPos: 'asc',
      }
    });

    const formattedInventory =
      formatInventoryWithTotalValueAndStatus(inventory);

    const itemNames = formattedInventory.map((item: any) => item.name);

    const sortedItems = sortedItemKeys(itemNames, inventoryOrder);

    const sortedInventoryItem = [];
    for (const item of sortedItems) {
      const inventoryItem = formattedInventory.find(
        (i: any) => i.name === item,
      );
      if (inventoryItem) {
        sortedInventoryItem.push(inventoryItem);
      }
    }

    const types = await prisma.itemType.findMany({
      include: {
        inventoryItems: {
          include: {
            vendorItem: {
              include: {
                vendor: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: sortedInventoryItem,
      types,
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
