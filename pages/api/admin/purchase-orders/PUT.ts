import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IBody {
  id: number;
  estArrival: string;
  discount: number;
  items: any[];
  note: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, estArrival, discount, items, note } = req.body as IBody;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const existingPo = await prisma.pO.findUnique({
      where: {
        id: id,
      },
      include: {
        poItems: true,
      },
    });

    if (!existingPo) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Update PO - estArrival, note
    if (
      estArrival !== existingPo.estArrival ||
      note !== existingPo.note ||
      discount !== existingPo.discount
    ) {
      await prisma.pO.update({
        where: {
          id: id,
        },
        data: {
          estArrival: estArrival,
          note,
          discount,
        },
      });
    }

    // Handle items
    // Field to update: orderedQty, costPerItem, inventoryUnitId, tax
    const toCreateItems: any[] = [];
    const categorizeItemsPromises = items.map((updatedItem: any) => {
      const existingItem = existingPo.poItems.find(
        (item: any) => item.inventoryItemId === updatedItem.inventoryItemId,
      );
      if (existingItem) {
        // Update existing item
        return prisma.pOItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            orderedQty: updatedItem.orderedQty,
            costPerItem: updatedItem.costPerItem,
            inventoryUnitId: updatedItem.inventoryUnit.id,
            tax: updatedItem.tax,
          },
        });
      } else {
        // Create new item
        toCreateItems.push({
          poId: id,
          inventoryItemId: updatedItem.inventoryItemId,
          orderedQty: updatedItem.orderedQty,
          costPerItem: updatedItem.costPerItem,
          inventoryUnitId: updatedItem.inventoryUnit.id,
          tax: updatedItem.tax,
        });
      }
    });

    await Promise.all(categorizeItemsPromises);

    await prisma.pOItem.createMany({
      data: toCreateItems,
    });

    // Deleted items - existingpo.items have but updated item does not have
    const deletedItems = existingPo.poItems.filter((item: any) => {
      const existUpdatedItem = items.find(
        (updatedItem: any) =>
          updatedItem.inventoryItemId === item.inventoryItemId,
      );

      return !existUpdatedItem;
    });

    await prisma.pOItem.deleteMany({
      where: {
        id: {
          in: deletedItems.map((item: any) => item.id),
        },
      },
    });

    // Update PO - totalCost, subtotal, tax, total
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.costPerItem * item.orderedQty,
      0,
    );
    const tax = items.reduce(
      (acc: number, item: any) => acc + item.tax * item.orderedQty,
      0,
    );
    const total = subtotal + tax - discount;

    await prisma.pO.update({
      where: {
        id: id,
      },
      data: {
        totalCost: total,
        subtotal: subtotal,
        tax: tax,
      },
    });

    return res
      .status(200)
      .json({ message: 'Purchase order updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
