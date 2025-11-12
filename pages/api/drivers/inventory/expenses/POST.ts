/* eslint-disable @typescript-eslint/no-unused-vars */
import { mainPaymentMethodId } from '@/app/lib/constant';
import { TRANSACTION_STATUS, USER_ROLE } from '@/app/utils/enum';
import { IInventoryUnit } from '@/app/utils/type';
import {
  checkAndUpdateUnits,
  checkIsExpenseValid,
  createFifo,
  createOrderedItems,
  updateVendorItemQuantity,
} from '@/pages/api/admin/[companyId]/inventory/expenses/POST';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { InventoryLogFrom, InventoryLogType } from '@prisma/client';
import { recordTransactionInventoryLog } from '@/pages/api/utils/logs';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IBody {
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  status: TRANSACTION_STATUS;
  createdAt: string;
  invoice: string;
  spentBy: string;
  discount: number;
  GST: number;
  PST: number;
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
    vendorId: number;
    unit: IInventoryUnit;
    units: IInventoryUnit[];
    inventoryItemId: number;
    companyId: number;
  }[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      date,
      amount,
      description,
      paymentMethodId,
      status,
      createdAt,
      invoice,
      items,
      spentBy,
      discount,
      GST,
      PST,
    }: IBody = req.body;

    const driver = await getDriverInfo(req, res);

    if (!driver) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!existingMethod) {
      return res.status(404).json({
        error: 'Payment Method Not Found',
      });
    }

    if (paymentMethodId !== mainPaymentMethodId) {
      return res.status(400).json({
        error: 'Payment Method Not Allowed',
      });
    }

    const dateBoard = await prisma.codBoard.findFirst({
      where: {
        date: date,
        driverId: driver.id,
        companyId: driver.companyId,
      },
      include: {
        expense: true,
      },
    });

    if (!dateBoard) {
      return res.status(404).json({
        error: `Your Board Is Not Available For ${date}`,
      });
    }
    const vendors = items.reduce((acc: any, item: any) => {
      if (!acc.includes(item.vendorId)) {
        acc.push(item.vendorId);
      }
      return acc;
    }, []);

    if (invoice && invoice.trim() !== '') {
      // Check if vendor has expense on that date
      const isExpenseValid = await checkIsExpenseValid(
        driver.companyId,
        invoice,
        date,
        vendors,
      );

      if (!isExpenseValid.ok) {
        return res.status(409).json({ error: isExpenseValid.error });
      }
    }

    const createdBy = await getCreatedBy(req, res, USER_ROLE.DRIVER);

    const newExpense = await prisma.expense.create({
      data: {
        invoice,
        date: date,
        amount: amount,
        description: description,
        status,
        paymentMethodId: paymentMethodId,
        spentBy,
        createdAt: createdAt,
        codBoardId: dateBoard.id,
        createdBy,
        companyId: driver.companyId,
        discount,
        GST,
        PST,
      },
    });

    // const vendorItems = await prisma.vendorItem.findMany({});
    // Create ordered items
    if (items.length > 0) {
      await createFifo(
        driver?.companyId || -1,
        items,
        createdAt,
        createdBy,
        newExpense.id,
      );

      const vendorItems = await prisma.vendorItem.findMany({
        where: {
          id: {
            in: items.map((item: any) => item.id),
          },
        },
        include: {
          unit: true,
        },
      });

      for (const item of items) {
        // STEP 2: Update quantity in vendor items
        const existedItem: any = vendorItems.find(
          (vendorItem: any) => vendorItem.id === item.id,
        );

        await updateVendorItemQuantity(existedItem, item);

        // STEP 3: Check unit price in Inventory Unit (Update if needed)
        await checkAndUpdateUnits(
          item?.companyId || -1,
          existedItem.unit,
          item.units,
          item.id,
          createdAt,
          createdBy,
        );

        // Record inventory log
        await recordTransactionInventoryLog(
          newExpense.id,
          existedItem.inventoryItemId,
          item.quantity,
          InventoryLogType.STOCK_IN,
          InventoryLogFrom.CREATE_TRANSACTION,
          `Create ${item.quantity} ${existedItem.inventoryItem.name} to inventory due to expense ${newExpense.id} created`,
        );
      }
      // STEP 4: Create OrderedItems
      // Use item already exist to easy to retrieve unitPrice
      const response = await createOrderedItems(
        Number(driver?.companyId || -1),
        items,
        newExpense,
        createdAt,
        createdBy,
      );

      if (!response.ok) {
        return res.status(404).json({
          error: response.error,
        });
      }
    }

    // Connect Vendors and Expense
    if (vendors.length > 0) {
      await prisma.vendorExpense.createMany({
        data: vendors.map((vendor: any) => {
          return {
            expenseId: newExpense.id,
            vendorId: vendor,
          };
        }),
      });
    }

    return res.status(201).json({
      data: newExpense,
      message: 'Stock Purchased Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
