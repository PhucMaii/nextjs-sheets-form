import { PO_STATUS, TRANSACTION_STATUS, USER_ROLE } from '@/app/utils/enum';
import { IPOItem } from '@/app/utils/type';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import { createFifo, createOrderedItems } from '../../inventory/expenses/POST';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import {
  Expense,
  InventoryLogType,
  InventoryLogFrom,
  PO,
} from '@prisma/client';
import { recordInventoryItemLog } from '@/pages/api/utils/logs';

interface IBody {
  poId: number;
  poItems: IPOItem[];
  expenseData: {
    invoice?: string;
    amount: number;
    subTotal: number;
    tax: number;
    description: string;
    paymentMethodId: number;
    spentBy: string;
    status: TRANSACTION_STATUS;
    date: string;
    discount?: number;
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { poId, poItems, expenseData } = req.body as IBody;

    const existingPo = await prisma.pO.findUnique({
      where: {
        id: poId,
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

    if (!existingPo) {
      return res.status(404).json({ error: 'PO not found' });
    }

    const poItemPromises = poItems.map((poItem) => {
      return prisma.pOItem.update({
        where: {
          id: poItem.id,
        },
        data: {
          receivedQty: poItem.receivedQty,
          rejectedQty: poItem.rejectedQty,
          costPerItem: poItem.costPerItem,
        },
      });
    });

    await Promise.all(poItemPromises);

    const today = getTodayDate();

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    // Convert to transaction
    const newTransaction = await prisma.expense.create({
      data: {
        amount: expenseData.amount,
        subTotal: expenseData.subTotal,
        GST: expenseData.tax,
        discount: expenseData?.discount || 0,
        createdAt: today.dateAndTime,
        createdBy: createdBy,
        description: expenseData.description,
        spentBy: expenseData.spentBy,
        date: expenseData.date,
        paymentMethodId: expenseData.paymentMethodId,
        status: expenseData.status,
        invoice: expenseData.invoice,
        companyId: Number(companyId),
      },
    });

    // Connect vendor and expense
    await prisma.vendorExpense.create({
      data: {
        vendorId: existingPo.vendorId,
        expenseId: newTransaction.id,
      },
    });

    // Set PO status to received and transaction id
    await prisma.pO.update({
      where: {
        id: poId,
      },
      data: {
        status: PO_STATUS.RECEIVED,
        expenseId: newTransaction.id,
        receivedAt: today.dateAndTime,
      },
    });

    if (existingPo.status !== PO_STATUS.PRE_APPROVED) {
      // If not pre approved, then create fifo and ordered items for new transaction
      await createFifoAndOrderedItemsForPOItems(
        existingPo,
        poItems,
        newTransaction,
        createdBy,
      );
    } else {
      // Find all vendor items
      const vendorItems = await prisma.vendorItem.findMany({
        where: {
          inventoryItemId: {
            in: poItems.map((poItem: any) => poItem.inventoryItemId),
          },
          vendorId: existingPo.vendorId,
        },
        include: {
          fifo: true,
          inventoryItem: true,
        },
      });

      // Map: inventoryItemId -> fifo (latest fifo)
      const fifoMap = new Map<number, any>();
      for (const vendorItem of vendorItems) {
        const latestFifo = vendorItem.fifo.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        console.log(latestFifo[0], 'latestFifo');
        fifoMap.set(vendorItem.inventoryItemId, latestFifo[0]);
      }

      // Map: poItemId -> poItem
      const poItemMap = new Map<number, any>();
      for (const item of existingPo.poItems) {
        poItemMap.set(item.id, item);
      }

      const toUpdateUnit = new Map<number, number>();
      const toUpdateFifo = new Map<number, any>();

      // Loop through po item from params
      const orderedItems: any = poItems.map((item: any) => {
        const fifo = fifoMap.get(item.inventoryItemId);

        // Get po item from existing po items
        const poItem = poItemMap.get(item.id);

        if (!poItem) {
          throw new Error('Conflict in Selected Unit');
        }

        const selectedUnit = poItem.inventoryUnit;

        if (item.costPerItem !== selectedUnit.unitPrice) {
          toUpdateUnit.set(selectedUnit.id, item.costPerItem);
        }

        if (item.qtyDelta > 0) {
          toUpdateFifo.set(fifo.id, {
            quantity: fifo.quantity + item.qtyDelta * selectedUnit.ratio,
            price:
              Math.round((item.costPerItem / selectedUnit.ratio) * 100) / 100,
            qtyDelta: item.qtyDelta,
            inventoryItemId: poItem.inventoryItemId,
            name: poItem.inventoryItem.name,
          });
        }

        return {
          fifoId: fifo.id,
          quantity: item.receivedQty,
          expenseId: newTransaction.id,
          price: item.costPerItem,
          name: poItem.inventoryItem.name,
          inventoryItemId: poItem.inventoryItemId,
          inventoryUnitId: selectedUnit.id,
          companyId: Number(companyId),
        };
      });

      await prisma.orderedItems.createMany({
        data: orderedItems,
      });

      // Update unit price if needed
      if (toUpdateUnit.size > 0) {
        for (const [unitId, unitPrice] of Array.from(toUpdateUnit.entries())) {
          await prisma.inventoryUnit.update({
            where: { id: unitId },
            data: { unitPrice: unitPrice },
          });
        }
      }

      // Update fifo quantity and fifo price if needed
      if (toUpdateFifo.size > 0) {
        for (const [
          fifoId,
          { quantity, price, qtyDelta, inventoryItemId, name },
        ] of Array.from(toUpdateFifo.entries())) {
          await prisma.fifo.update({
            where: { id: fifoId },
            data: { quantity, price },
          });

          // Record inventory log
          await recordInventoryItemLog(
            Number(companyId),
            inventoryItemId,
            qtyDelta,
            qtyDelta > 0
              ? InventoryLogType.STOCK_IN
              : InventoryLogType.SUBTRACT,
            InventoryLogFrom.CREATE_TRANSACTION,
            `${qtyDelta > 0 ? 'Receive' : 'Subtract'} ${qtyDelta} ${name} to inventory due to purchase order ${poId} received with edited purchase order items`,
          );
        }
      }
    }

    return res.status(200).json({ message: 'Received Items Successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export default withAdminAuthGuard(handler);

export const createFifoAndOrderedItemsForPOItems = async (
  po: PO,
  poItems: IPOItem[],
  expense: Expense,
  createdBy: string,
) => {
  const today = getTodayDate();
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

  const itemParamsFifo: any[] = [];
  for (const poItem of poItems) {
    const vendorItemId = vendorItemMap.get(poItem.inventoryItemId);

    const isExistingInItemParamsFifo = itemParamsFifo.find(
      (item) => item.inventoryItemId === poItem.inventoryItemId,
    );

    if (!vendorItemId) {
      console.error('Vendor Item Not Found in receive purchase order');
      continue;
    }

    // If item already exists in itemParamsFifo, update the quantity
    if (isExistingInItemParamsFifo) {
      isExistingInItemParamsFifo.quantity += poItem.receivedQty;
      continue;
    }

    if (vendorItemId) {
      itemParamsFifo.push({
        id: vendorItemId,
        quantity: poItem.receivedQty,
        price: poItem.costPerItem,
        vendorId: po.vendorId,
        unit: {
          ...poItem.inventoryUnit,
          unitPrice: poItem.costPerItem,
        },
        inventoryItemId: poItem.inventoryItemId,
        inventoryItem: poItem.inventoryItem,
        companyId: po.companyId,
      });
    }
  }

  // Create items for the transaction
  if (itemParamsFifo.length > 0) {
    await createFifo(
      po.companyId || 1,
      itemParamsFifo,
      today.dateAndTime,
      createdBy,
      expense.id,
    );

    const response = await createOrderedItems(
      po.companyId || 1,
      itemParamsFifo,
      expense,
      today.dateAndTime,
      createdBy,
    );

    if (!response.ok) {
      throw new Error(response.error || 'Failed to create ordered items');
    }
  }

  return { ok: true, error: null };
};
