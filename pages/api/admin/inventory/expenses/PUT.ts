import { getUserInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IPurchasedItem {
  id: number; // Inventory Item Id
  name: string;
  quantity: number;
  unitPrice: number;
  vendorId: number;
  unit: string;
  inventoryItem: any;
}

interface IBody {
  id: number;
  amount: number;
  description: string;
  date: string;
  paymentMethodId: number;
  spentBy: string;
  invoice: string;
  oldItemIds: number[]; // Ordered items ids
  updatedItems: IPurchasedItem[];
  updatedAt: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      id,
      amount,
      invoice,
      description,
      date,
      paymentMethodId,
      spentBy,
      oldItemIds,
      updatedItems,
      updatedAt,
    }: IBody = req.body;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: id,
      },
      include: {
        orderedItems: true,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (invoice !== existingExpense.invoice) {
      const existingInvoice = await prisma.expense.findFirst({
        where: {
          invoice: invoice,
          vendors: {
            some: {
              vendorId: updatedItems[0].vendorId,
            }
          }
        },
      });

      if (existingInvoice) {  
        return res.status(400).json({ error: 'Invoice Number already exists' });
      }
    }

    await prisma.expense.update({
      where: {
        id: id,
      },
      data: {
        amount: amount,
        description: description,
        date: date,
        invoice,
        paymentMethodId: paymentMethodId,
        spentBy: spentBy,
      },
      include: {
        orderedItems: true,
      },
    });

    if (oldItemIds.length > 0 && updatedItems.length > 0) {
      // Delete all items and create new ones
      await prisma.orderedItems.deleteMany({
        where: {
          id: {
            in: oldItemIds,
          },
        },
      });

      await prisma.orderedItems.createMany({
        data: updatedItems.map((item) => ({
          expenseId: id,
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
      });

      const user = await getUserInfo(req, res);
      // Update inventory items quantity
      for (const item of updatedItems) {
        const oldInventoryItem: any = existingExpense.orderedItems.find(
          (orderedItem: any) => {
            return orderedItem.id === item.id;
          },
        );

        // Item already existed in inventory
        if (item.inventoryItem) {
          const existingItem = await prisma.inventoryItem.findUnique({
            where: {
              id: item.inventoryItem.id,
            },
          });

          console.log(item, 'item');
          if (!existingItem) {
            await prisma.inventoryItem.create({
              data: {
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unit: item?.inventoryItem?.unit || 'bags',
                vendorId: item.inventoryItem.vendorId,
                createdAt: updatedAt,
                createdBy: `Admin - ${user?.clientName}`,
              },
            });
          } else {
            await prisma.inventoryItem.update({
              where: {
                id: item.inventoryItem.id,
              },
              data: {
                quantity:
                  item.inventoryItem.quantity - oldInventoryItem?.quantity ||
                  0 + item.quantity,
                unitPrice: item.unitPrice,
              },
            });
          }

        } else {
          const vendor: any = await prisma.vendorExpense.findFirst({
            where: {
              expenseId: existingExpense.id,
            }
          })
          // New item
          await prisma.inventoryItem.create({
            data: {
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unit: 'bags',
              vendorId: vendor.vendorId,
              createdAt: updatedAt,
              createdBy: `Admin - ${user?.clientName}`,
            },
          });
        }
      }
    }

    return res.status(200).json({ message: 'Expense updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
