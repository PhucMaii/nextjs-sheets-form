/* eslint-disable @typescript-eslint/no-unused-vars */
import { mainPaymentMethodId } from '@/app/lib/constant';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  createdAt: string;
  invoice: string;
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
    vendorId: number;
    unit: string;
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

    // Check if vendor has expense on that date
    const existingVendorExpense = await prisma.expense.findMany({
      where: {
        invoice: invoice,
        date: date,
        vendors: {
          some: {
            vendorId: {
              in: vendors,
            },
          },
        },
      },
    });

    if (existingVendorExpense.length > 0) {
      return res
        .status(409)
        .json({ error: `Expense Already Exists For "${invoice}" On ${date}` });
    }

    const newExpense = await prisma.expense.create({
      data: {
        invoice,
        date: date,
        amount: amount,
        description: description,
        paymentMethodId: paymentMethodId,
        spentBy: `Driver - ${driver.name}`,
        createdAt: createdAt,
        codBoardId: dateBoard.id,
        createdBy: `Driver - ${driver.name}`,
      },
    });

    const inventoryItems = await prisma.inventoryItem.findMany({});
    // Create ordered items
    if (items.length > 0) {
      await prisma.orderedItems.createMany({
        data: items.map((item: any) => {
          return {
            name: item.name,
            price: item.unitPrice,
            quantity: item.quantity,
            expenseId: newExpense.id,
          };
        }),
      });

      for (const item of items) {
        // Only allow driver to select old items, not allow them to create new items -> only inventory items
        const existedItem = inventoryItems.find((inventoryItem: any) => {
          return inventoryItem.id === item.id;
        });

        if (!existedItem) {
          return res.status(404).json({
            error:
              'Driver Can Only Select Inventory Items, Not Allow To Create New Items',
          });
        }

        await prisma.inventoryItem.update({
          where: {
            id: existedItem.id,
          },
          data: {
            quantity: existedItem.quantity + item.quantity,
            unitPrice: item.unitPrice,
          },
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
