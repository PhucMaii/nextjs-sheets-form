import { PO_STATUS } from '@/app/utils/enum';
import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { IPOItem } from '@/app/utils/type';
import { getTodayDate } from '@/pages/api/utils/date';
import { InventoryLogFrom, InventoryLogType, PO } from '@prisma/client';
import { recordInventoryItemLog } from '@/pages/api/utils/logs';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

interface IBody {
  id: number;
  poItems: IPOItem[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, poItems }: IBody = req.body;

    const po = await prisma.pO.findUnique({
      where: { id: id },
      include: {
        poItems: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    await createFifoForPOItems(po, poItems);

    return res.status(200).json({ message: 'Purchase order pre approved' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default withAdminAuthGuard(handler);

export const createFifoForPOItems = async (po: PO, poItems: IPOItem[]) => {
  const vendorItems = await prisma.vendorItem.findMany({
    where: {
      inventoryItemId: {
        in: poItems.map((poItem: any) => poItem.inventoryItemId),
      },
      vendorId: po.vendorId,
    },
  });

  const vendorItemMap = new Map<number, number>();
  for (const vendorItem of vendorItems) {
    vendorItemMap.set(vendorItem.inventoryItemId, vendorItem.id);
  }

  const today = getTodayDate();
  await prisma.$transaction(async (tx) => {
    // Update po items
    const poItemPromises = poItems.map(async (poItem: any) => {
      // Create new fifo
      const vendorItemId = vendorItemMap.get(poItem.inventoryItemId);
      const inventoryItemId = poItem.inventoryItemId;
      if (!vendorItemId || !inventoryItemId || !poItem.inventoryUnit) {
        return;
      }
      await tx.fifo.create({
        data: {
          inventoryItemId: poItem.inventoryItemId,
          quantity: poItem.receivedQty * poItem.inventoryUnit.ratio,
          vendorItemId: vendorItemId,
          companyId: po.companyId,
          createdAt: today.dateAndTime,
          createdBy: 'System - Pre Approve Purchase Order',
        },
      });

      // If cost per item is not equal to unit price, update unit price
      if (poItem.costPerItem !== poItem.inventoryUnit.unitPrice) {
        await tx.inventoryUnit.update({
          where: { id: poItem.inventoryUnitId },
          data: { unitPrice: poItem.costPerItem },
        });
      }

      // record inventory log
      await recordInventoryItemLog(
        po.companyId || 1,
        poItem.inventoryItemId,
        poItem.receivedQty,
        InventoryLogType.STOCK_IN,
        InventoryLogFrom.PRE_APPROVE_PO,
        `Create ${poItem.receivedQty} ${poItem.inventoryItem.name} to inventory due to purchase order ${po.id} pre approved`,
        tx,
      );

      return tx.pOItem.update({
        where: { id: poItem.id },
        data: {
          receivedQty: poItem.receivedQty,
          rejectedQty: poItem.rejectedQty,
          costPerItem: poItem.costPerItem,
        },
      });
    });
    await Promise.all(poItemPromises);

    // Update po
    await tx.pO.update({
      where: { id: po.id },
      data: { status: PO_STATUS.PRE_APPROVED },
    });
  });
};
