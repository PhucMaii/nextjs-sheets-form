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
        orderedItems: {
          include: {
            fifo: true,
          },
        },
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense Not Found' });
    }

    const vendorItems = await prisma.vendorItem.findMany({});

    // Decrease quantity
    for (const item of existingExpense.orderedItems) {
      if (!item?.fifo) {
        console.error('No FIFO found');
        continue;
      }

      const vendorItem = vendorItems.find((vendorItem: any) => {
        if (!item.fifo) {
          return false;
        }

        return vendorItem.id === item.fifo.vendorItemId;
      });

      if (!vendorItem) {
        console.error('No vendor item found');
        continue;
      }

      const newQuantity = vendorItem.quantity - item.fifo.quantity;

      await prisma.vendorItem.update({
        where: {
          id: vendorItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });

      await prisma.fifo.delete({
        where: {
          id: item.fifo.id,
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
