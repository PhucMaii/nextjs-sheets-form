import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import { checkAndUpdateUnits } from './expenses/POST';

interface IBody {
  id: number;
  name: string;
  vendorItems: any[];
  updatedAt: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, name, vendorItems, updatedAt }: IBody = req.body;

    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id,
      },
      include: {
        vendorItem: {
          include: {
            vendor: true,
            fifo: true,
            unit: true,
          },
        },
      }
    });

    if (!existingInventoryItem) {
      return res.status(404).json({
        error: 'Inventory Item Not Found',
      });
    };

    const sameNameInventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        name,
        id: {
          not: existingInventoryItem.id,
        },
      },
    });

    if (sameNameInventoryItem) {
      return res.status(400).json({
        error: 'Inventory Item Already Exists',
      });
    }

    if (existingInventoryItem.name !== name) {
      await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
    }
    
    const user: any = await getUserInfo(req, res);
    const createdBy = `Admin - ${user.clientName}`;

    let dbInventoryItemLeft = existingInventoryItem.vendorItem;
    for (const updatedVendorItem of vendorItems) {
      if (updatedVendorItem.id > 0) {
        const existingVendorItem = existingInventoryItem.vendorItem.find((item: any) => item.id === updatedVendorItem.id);

        if (!existingVendorItem) {
          console.error('Vendor Item Not Found');
          continue;
        }

        // Check units and update units
        await checkAndUpdateUnits(existingVendorItem.unit, updatedVendorItem.units, existingInventoryItem.id, updatedAt, createdBy);

        dbInventoryItemLeft = dbInventoryItemLeft.filter((item: any) => item.id !== existingVendorItem.id);
      } else {
        // Case: New Vendor Item
        const newVendorItem = await prisma.vendorItem.create({
          data: {
            inventoryItemId: id,
            vendorId: updatedVendorItem.vendorId,
            quantity: updatedVendorItem.quantity,
            createdAt: updatedAt,
            createdBy
          }
        });

        // Create Inventory Unit
        await prisma.inventoryUnit.createMany({
          data: updatedVendorItem.units.map((unit: any) => {
            return {
              vendorItemId: newVendorItem.id,
              unit: unit.unit,
              unitPrice: unit.unitPrice,
              ratio: unit.ratio,
              createdAt: updatedAt,
              createdBy
            }
          })
        })
      }
    }

    // Delete old vendor items
    if (dbInventoryItemLeft.length > 0) {
      await prisma.vendorItem.deleteMany({
        where: {
          id: {
            in: dbInventoryItemLeft.map((item: any) => item.id),
          },
        },
      });
    }
    
    return res.status(200).json({
      message: 'Inventory Item Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
