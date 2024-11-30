/* eslint-disable @typescript-eslint/no-unused-vars */
import { mainPaymentMethodId } from '@/app/lib/constant';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { IInventoryUnit } from '@/app/utils/type';
import { checkAndUpdateUnits, checkIsExpenseValid, createFifo, createOrderedItems, updateVendorItemQuantity } from '@/pages/api/admin/inventory/expenses/POST';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  status: TRANSACTION_STATUS;
  createdAt: string;
  invoice: string;
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
    vendorId: number;
    unit: IInventoryUnit;
    units: IInventoryUnit[];
    inventoryItemId: number;
  }[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      date,
      amount,
      description,
      paymentMethodId,
      status,
      createdAt,
      invoice,
      items,
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
      const isExpenseValid = await checkIsExpenseValid(invoice, date, vendors);

      if (!isExpenseValid.ok) {
        return res.status(409).json({ error: isExpenseValid.error });
      }
    }

    const createdBy = `Driver - ${driver.name}`

    const newExpense = await prisma.expense.create({
      data: {
        invoice,
        date: date,
        amount: amount,
        description: description,
        status,
        paymentMethodId: paymentMethodId,
        spentBy: createdBy,
        createdAt: createdAt,
        codBoardId: dateBoard.id,
        createdBy,
      },
    });

    const vendorItems = await prisma.vendorItem.findMany({});
    // Create ordered items
    if (items.length > 0) {
      await createFifo(items, createdAt, createdBy);

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
          (vendorItem) => vendorItem.id === item.id,
        );

        await updateVendorItemQuantity(existedItem, item);

        // STEP 3: Check unit price in Inventory Unit (Update if needed)
        await checkAndUpdateUnits(
          existedItem.unit,
          item.units,
          item.id,
          createdAt,
          createdBy,
        );
      }
      // STEP 4: Create OrderedItems
      // Use item already exist to easy to retrieve unitPrice
      const response = await createOrderedItems(
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
      // await prisma.orderedItems.createMany({
      //   data: items.map((item: any) => {
      //     return {
      //       name: item.name,
      //       price: item.unitPrice,
      //       quantity: item.quantity,
      //       expenseId: newExpense.id,
      //     };
      //   }),
      // });

      // for (const item of items) {
      //   // Only allow driver to select old items, not allow them to create new items -> only inventory items
      //   const existedItem = vendorItems.find((vendorItem: any) => {
      //     return vendorItem.id === item.id;
      //   });

      //   if (!existedItem) {
      //     return res.status(404).json({
      //       error:
      //         'Driver Can Only Select Inventory Items, Not Allow To Create New Items',
      //     });
      //   }

      //   // await prisma.inventoryItem.update({
      //   //   where: {
      //   //     id: existedItem.id,
      //   //   },
      //   //   data: {
      //   //     quantity: existedItem.quantity + item.quantity,
      //   //     unitPrice: item.unitPrice,
      //   //   },
      //   // });
      // }
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
