import { STOCK_STATUS } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  vendorId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { vendorId }: IQuery = req.query;

    if (!vendorId) {
      const inventory: any = await prisma.inventoryItem.findMany({
        include: {
          vendorItem: {
            include: {
              vendor: true,
              fifo: true,
              unit: true,
            },
          },
        },
      });

      const formattedInventory =
        formatInventoryWithTotalValueAndStatus(inventory);

      return res.status(200).json({
        data: formattedInventory,
        message: 'Fetch Inventory Successfully',
      });
    }

    // const inventory: any = await prisma.inventoryItem.findMany({
    //   where: {
    //     vendorId: Number(vendorId),
    //   },
    //   include: {
    //     vendor: true,
    //   },
    // });
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
              acc.totalValue = fifo.quantity * baseUnit?.unitPrice || 1;
            } else {
              acc.totalValue += fifo.quantity * baseUnit?.unitPrice || 1;
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
