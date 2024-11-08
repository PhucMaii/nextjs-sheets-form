import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id }: { id?: string } = req.query;

    if (!id) {
      return res.status(404).json({ error: 'Expense Id Not Provided' });
    }

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        orderedItems: true,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense Not Found' });
    }

    const inventoryItems = await prisma.inventoryItem.findMany({});

    // Decrease quantity
    for (const item of existingExpense.orderedItems) {
      const inventoryItem = inventoryItems.find((i: any) => {
        return i.name === item.name;
      });

      if (!inventoryItem) {
        continue;
      }

      await prisma.inventoryItem.update({
        where: {
          id: inventoryItem.id,
        },
        data: {
          quantity: inventoryItem.quantity - item.quantity,
        },
      });
    }

    await prisma.expense.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({ message: 'Expense Deleted Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
