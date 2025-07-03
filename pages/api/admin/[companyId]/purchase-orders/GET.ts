import { NextApiRequest, NextApiResponse } from 'next';
import { formatDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';

interface IQuery {
  id?: string;
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate, id, companyId } = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required',
      });
    }

    if (id) {
      const purchaseOrder = await prisma.pO.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          poItems: {
            include: {
              inventoryUnit: true,
              inventoryItem: true,
            },
          },
          vendor: {
            include: {
              vendorItem: {
                include: {
                  inventoryItem: true,
                  unit: true,
                  fifo: true,
                },
              },
            },
          },
        },
      });

      // This condition fetch for /admin/purchase-orders/[id]
      // Return purchase order with units in case admin want to edit
      const formattedItems = purchaseOrder?.poItems.map((poItem) => {
        const targetVendorItem = purchaseOrder?.vendor?.vendorItem.find(
          (vendorItem) => vendorItem.inventoryItemId === poItem.inventoryItemId,
        );

        const itemTotalCost = poItem.costPerItem * poItem.orderedQty;

        return {
          ...poItem,
          units: targetVendorItem?.unit,
          total: itemTotalCost,
        };
      });

      return res.status(200).json({
        data: {
          ...purchaseOrder,
          poItems: formattedItems,
        },
        message: 'Purchase order fetched successfully',
      });
    }

    if (startDate && endDate) {
      // Convert startDate and endDate -> get list of dates string
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      const listOfDateString = generateListOfDateString(
        formattedStartDate,
        formattedEndDate,
      );

      const purchaseOrders = await prisma.pO.findMany({
        where: {
          estArrival: {
            in: listOfDateString,
          },
          companyId: Number(companyId),
        },
        include: {
          poItems: true,
          vendor: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      // Format purchase orders
      const formattedPurchaseOrders = purchaseOrders.map((po) => {
        const receivedItems = po.poItems.reduce(
          (acc, item) => acc + (item.receivedQty || 0),
          0,
        );

        const orderedItems = po.poItems.reduce(
          (acc, item) => acc + (item.orderedQty || 0),
          0,
        );

        return {
          ...po,
          receivedItems: receivedItems,
          totalItems: orderedItems,
        };
      });

      return res.status(200).json({
        data: formattedPurchaseOrders,
        message: 'Purchase orders fetched successfully',
      });
    }

    return res.status(400).json({ error: 'Invalid request' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
