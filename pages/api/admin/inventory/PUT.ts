import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  name: string;
  vendorId: number;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, name, vendorId, quantity, unitPrice, unit }: IBody = req.body;

    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id,
      },
    });

    if (!existingInventoryItem) {
      return res.status(404).json({
        error: 'Inventory Item Not Found',
      });
    }

    const sameUpdatedInventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        name,
        vendorId,
        id: {
          not: id,
        },
      },
    });

    if (sameUpdatedInventoryItem) {
      return res.status(400).json({
        error: 'Inventory Item Already Exists',
      });
    }

    const updatedInventoryItem = await prisma.inventoryItem.update({
      where: {
        id,
      },
      data: {
        name,
        vendorId,
        quantity,
        unitPrice,
        unit,
      },
    });

    return res.status(200).json({
      data: updatedInventoryItem,
      message: 'Inventory Item Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
