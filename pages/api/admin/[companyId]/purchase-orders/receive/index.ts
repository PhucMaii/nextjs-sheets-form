import { PO_STATUS, TRANSACTION_STATUS, USER_ROLE } from '@/app/utils/enum';
import { IPOItem } from '@/app/utils/type';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import { createFifo, createOrderedItems } from '../../inventory/expenses/POST';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { Expense, PO } from '@prisma/client';

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
      await createFifoAndOrderedItemsForPOItems(
        existingPo,
        poItems,
        newTransaction,
        createdBy,
      );
    } else {
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

      const fifoMap = new Map<number, number>();
      for (const vendorItem of vendorItems) {
        const latestFifo = vendorItem.fifo.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        fifoMap.set(vendorItem.inventoryItemId, latestFifo[0].id);
      }

      const poItemMap = new Map<number, any>();
      for (const item of existingPo.poItems) {
        poItemMap.set(item.id, item);
      }

      const toUpdateUnit = new Map<number, number>();

      const orderedItems: any = poItems.map((item: any) => {
        const fifoId = fifoMap.get(item.inventoryItemId);

        const poItem = poItemMap.get(item.id);

        if (!poItem) {
          throw new Error('Conflict in Selected Unit');
        }

        const selectedUnit = poItem.inventoryUnit;

        if (item.costPerItem !== selectedUnit.unitPrice) {
          toUpdateUnit.set(selectedUnit.id, item.costPerItem);
        }

        return {
          fifoId: fifoId,
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

      if (toUpdateUnit.size > 0) {
        for (const [unitId, unitPrice] of Array.from(toUpdateUnit.entries())) {
          await prisma.inventoryUnit.update({
            where: { id: unitId },
            data: { unitPrice: unitPrice },
          });
        }
      }
    }

    // Create map vendor item id to po item id
    // const vendorItems = await prisma.vendorItem.findMany({
    //   where: {
    //     inventoryItemId: {
    //       in: poItems.map((poItem: any) => poItem.inventoryItemId),
    //     },
    //     vendorId: existingPo.vendorId,
    //   },
    // });

    // const vendorItemMap = new Map<number, number>();
    // for (const vendorItem of vendorItems) {
    //   vendorItemMap.set(vendorItem.inventoryItemId, vendorItem.id);
    // }

    // const itemParamsFifo: any[] = [];
    // for (const poItem of poItems) {
    //   const vendorItemId = vendorItemMap.get(poItem.inventoryItemId);

    //   const isExistingInItemParamsFifo = itemParamsFifo.find(
    //     (item) => item.inventoryItemId === poItem.inventoryItemId,
    //   );

    //   if (!vendorItemId) {
    //     console.error('Vendor Item Not Found in receive purchase order');
    //     continue;
    //   }

    //   // If item already exists in itemParamsFifo, update the quantity
    //   if (isExistingInItemParamsFifo) {
    //     isExistingInItemParamsFifo.quantity += poItem.receivedQty;
    //     continue;
    //   }

    //   if (vendorItemId) {
    //     itemParamsFifo.push({
    //       id: vendorItemId,
    //       quantity: poItem.receivedQty,
    //       price: poItem.costPerItem,
    //       vendorId: existingPo.vendorId,
    //       unit: {
    //         ...poItem.inventoryUnit,
    //         unitPrice: poItem.costPerItem,
    //       },
    //       inventoryItemId: poItem.inventoryItemId,
    //       inventoryItem: poItem.inventoryItem,
    //       companyId: Number(companyId),
    //     });
    //   }
    // }

    // // Create items for the transaction
    // if (itemParamsFifo.length > 0) {
    //   await createFifo(
    //     Number(companyId),
    //     itemParamsFifo,
    //     today.dateAndTime,
    //     createdBy,
    //     newTransaction.id,
    //   );

    //   const response = await createOrderedItems(
    //     Number(companyId),
    //     itemParamsFifo,
    //     newTransaction,
    //     today.dateAndTime,
    //     createdBy,
    //   );

    //   if (!response.ok) {
    //     return res.status(404).json({
    //       error: response.error,
    //     });
    //   }
    // }

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
