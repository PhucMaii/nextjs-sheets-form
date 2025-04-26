import { PO_STATUS, TRANSACTION_STATUS } from '@/app/utils/enum';
import { IPOItem } from '@/app/utils/type';
import { getUserInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { createFifo, createOrderedItems } from '../../inventory/expenses/POST';

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

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { poId, poItems, expenseData } = req.body as IBody;

    const existingPo = await prisma.pO.findUnique({
      where: {
        id: poId,
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
    const adminUser: any = await getUserInfo(req, res);

    const createdBy = `Admin - ${adminUser.clientName}`;
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

    const itemParamsFifo: any[] = [];
    for (const poItem of poItems) {
      const vendorItem = await prisma.vendorItem.findFirst({
        where: {
          inventoryItemId: poItem.inventoryItemId,
          vendorId: existingPo.vendorId,
        },
      });

      if (vendorItem) {
        itemParamsFifo.push({
          id: vendorItem.id,
          quantity: poItem.receivedQty,
          price: poItem.costPerItem,
          vendorId: existingPo.vendorId,
          unit: {
            ...poItem.inventoryUnit,
            unitPrice: poItem.costPerItem,
          },
          inventoryItemId: poItem.inventoryItemId,
          inventoryItem: poItem.inventoryItem,
        });
      }
    }
    // Create items for the transaction
    if (itemParamsFifo.length > 0) {
      await createFifo(itemParamsFifo, today.dateAndTime, createdBy);

      const response = await createOrderedItems(itemParamsFifo, newTransaction, today.dateAndTime, createdBy);

      if (!response.ok) {
        return res.status(404).json({
          error: response.error,
        });
      }
    }

    return res.status(200).json({ message: 'Received Items Successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export default withAdminAuthGuard(handler);
