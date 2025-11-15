import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import { PO_STATUS } from '@/app/utils/enum';
import prisma from '@/client';
import { createFifo } from '../../admin/[companyId]/inventory/expenses/POST';
import { VendorItem } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const today = getTodayDate();

    const companies = await prisma.company.findMany();
    for (const company of companies) {
      // Get all POs that are not ordered state and delivery date is today
      const poList = await prisma.pO.findMany({
        where: {
          companyId: company.id,
          status: PO_STATUS.ORDERED,
          estArrival: today.date,
        },
        include: {
          poItems: {
            include: {
              inventoryItem: true,
              inventoryUnit: true,
            },
          }, 
        },
      });

      if (poList.length === 0) {
        return res.status(200).json({ message: 'No POs to pre-approve' });
      }

      const itemParamsFifo: any[] = [];

      await prisma.$transaction(async (tx) => {
        // Loop through each PO
        // Set status to pre-approved
        await tx.pO.updateMany({
          where: {
            id: {
              in: poList.map((po) => po.id),
            },
          },
          data: {
            status: PO_STATUS.PRE_APPROVED,
          },
        });

        // Stock in inventory items
        for (const po of poList) {
          if (!po.poItems || po.poItems.length === 0) {
            continue;
          }

          const vendorItems = await tx.vendorItem.findMany({
            where: {
              inventoryItemId: {
                in: po.poItems.map((poItem) => poItem.inventoryItemId),
              },
              vendorId: po.vendorId,
            },
          });

          // Map: inventoryItemId -> vendorItem
          const vendorItemMap = new Map<number, VendorItem>();
          for (const vendorItem of vendorItems) {
            vendorItemMap.set(vendorItem.inventoryItemId, vendorItem);
          }

          for (const poItem of po.poItems) {
            const vendorItem = vendorItemMap.get(poItem.inventoryItemId);

            const existingItemParamsFifo = itemParamsFifo.find(
              (item) => item.inventoryItemId === poItem.inventoryItemId,
            );

            if (!vendorItem) {
              console.error(
                'Vendor Item Not Found in pre-approve purchase order',
              );
              continue;
            }

            if (existingItemParamsFifo) {
              existingItemParamsFifo.quantity += poItem.receivedQty;
              continue;
            }

            itemParamsFifo.push({
              id: vendorItem.id,
              quantity: poItem.receivedQty,
              price: poItem.costPerItem,
              vendorId: po.vendorId,
              unit: {
                ...poItem.inventoryUnit,
                unitPrice: poItem.costPerItem,
              },
              inventoryItemId: poItem.inventoryItemId,
              inventoryItem: poItem.inventoryItem,
              companyId: Number(po.companyId),
            });
          }
        }
      });

      await createFifo(
        Number(company.id),
        itemParamsFifo,
        today.dateAndTime,
        `Cron - Pre-approve Purchase Order`,
      );
    }

    // Record inventory log
  } catch (error) {
    console.log('Something went wrong: ', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
