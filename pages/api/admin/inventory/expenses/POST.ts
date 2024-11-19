import { getUserInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  spentBy: string;
  createdAt: string;
  invoice: string;
  codBoardId?: number;
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
      spentBy,
      createdAt,
      invoice,
      codBoardId,
      items,
    }: IBody = req.body;

    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!existingMethod) {
      return res.status(404).json({ error: 'Payment Method Not Found' });
    }

    const user: any = await getUserInfo(req, res);

    const vendors = items.reduce((acc: any, item: any) => {
      if (!acc.includes(item.vendorId)) {
        acc.push(item.vendorId);
      }
      return acc;
    }, []);

    if (invoice && invoice?.trim() !== '') {
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
          .json({ error: `Expense Already Exists For ${invoice}` });
      }
    }

    const newExpense = await prisma.expense.create({
      data: {
        invoice,
        date: date,
        amount: amount,
        description: description,
        paymentMethodId: paymentMethodId,
        spentBy: spentBy,
        createdAt: createdAt,
        codBoardId: codBoardId,
        createdBy: `Admin - ${user?.clientName}`,
      },
    });

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
    }

    const itemsAlreadyExist = items.filter((item: any) => item.id > 0);
    const itemsToCreate = items.filter((item: any) => item.id === 0);

    const inventoryItems = await prisma.inventoryItem.findMany({});

    // Update existing inventory items
    if (itemsAlreadyExist.length > 0) {
      // await prisma.inventoryItem.updateMany({
      //   where: {
      //     id: {
      //       in: itemsAlreadyExist.map((item: any) => item.id),
      //     },
      //   },
      //   data: {
      //     quantity: {
      //       increment: itemsAlreadyExist.reduce((acc: number, item: any) => {
      //         return acc + item.quantity;
      //       }, 0),
      //     },
      //   },
      // });

      for (const item of itemsAlreadyExist) {
        const existedItem = inventoryItems.find(
          (inventoryItem) => inventoryItem.id === item.id,
        );
        if (!existedItem) continue;

        await prisma.inventoryItem.update({
          where: {
            id: item.id,
          },
          data: {
            quantity: existedItem.quantity + item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }
    }

    // Create new inventory items
    if (itemsToCreate.length > 0) {
      await prisma.inventoryItem.createMany({
        data: itemsToCreate.map((item: any) => {
          return {
            vendorId: item.vendorId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            createdAt,
            createdBy: `Admin - ${user?.clientName}`,
          };
        }),
      });
    }

    return res.status(200).json({ message: 'Expense created successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
