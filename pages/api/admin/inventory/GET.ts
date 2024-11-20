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
            }
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
        vendorId: Number(vendorId)
      },
      include: {
        inventoryItem: {
          include: {
            vendorItem: {
              include: {
                vendor: true,
                fifo: true,
                unit: true,
              }
            }
          }
        },
      }
    });

    const formattedInventory: any[] = [];

    for (const vendorItem of vendorItems) {
      const existingInventoryItem = formattedInventory.find(
        (item: any) => item.id === vendorItem.inventoryItemId,
      );

      if (existingInventoryItem) {
        continue;
      }

      const formattedItem = formatInventoryWithTotalValueAndStatus([vendorItem.inventoryItem]);
      formattedInventory.push(...formattedItem);
    }

    // const formattedInventory =
    //   formatInventoryWithTotalValueAndStatus(inventoryItems);

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
  const newInventoryItems = inventoryItems.map((inventoryItem: IInventoryItem) => {
    const quantityAndValue = inventoryItem?.fifo?.reduce((acc: any, fifo: any) => {
      const targetedVendorItem = fifo.vendorItem.unit.find((unit: any) => unit.isSmallest);

      if (!acc['totalQuantity']) {
        acc['totalQuantity'] = fifo.quantity;
      } else {
        acc['totalQuantity'] += fifo.quantity;
      }

      if (!acc['totalValue']) {
        acc['totalValue'] = acc + (fifo.quantity * targetedVendorItem.unitPrice || 1);
      } else {
        acc['totalValue'] += acc + (fifo.quantity * targetedVendorItem.unitPrice || 1);
      }

      return acc;
    }, {});

    let status = STOCK_STATUS.OUT_OF_STOCK;
    if (!quantityAndValue['totalQuantity'] && !quantityAndValue['totalValue']) {
      return {
        ...inventoryItem,
        totalValue: 0,
        quantity: 0,
        stockStatus: status
      }
    }
    if (quantityAndValue['totalQuantity'] === 0) {
      status = STOCK_STATUS.OUT_OF_STOCK;
    } else if (quantityAndValue['totalQuantity'] < 10) {
      status = STOCK_STATUS.LOW_STOCK;
    } else {
      status = STOCK_STATUS.IN_STOCK;
    }

    return {
      ...inventoryItem,
      totalValue: quantityAndValue['totalValue'] || 0,
      quantity: quantityAndValue['totalQuantity'] || 0,
      stockStatus: status
    }
  });

  return newInventoryItems;
};
