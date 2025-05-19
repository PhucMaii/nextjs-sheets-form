import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits } from './expenses/POST';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface IBody {
  id: number;
  name: string;
  sku: string;
  supplierSku: string;
  color: string;
  hasPST?: boolean;
  hasGST?: boolean;
  vendorItems: any[];
  updatedAt: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    const {
      id,
      name,
      sku,
      supplierSku,
      color,
      hasPST,
      hasGST,
      vendorItems,
      updatedAt,
    }: IBody = req.body;

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
      },
    });

    if (!existingInventoryItem) {
      return res.status(404).json({
        error: 'Inventory Item Not Found',
      });
    }

    const sameNameInventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        name,
        id: {
          not: existingInventoryItem.id,
        },
        companyId: Number(companyId),
      },
    });

    if (sameNameInventoryItem) {
      return res.status(400).json({
        error: 'Inventory Item Already Exists',
      });
    }

    if (
      existingInventoryItem.name !== name ||
      existingInventoryItem.sku !== sku ||
      existingInventoryItem.supplierSku !== supplierSku
    ) {
      await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          name,
          sku,
          supplierSku,
        },
      });
    }

    if (
      existingInventoryItem.hasPST !== hasPST ||
      existingInventoryItem.hasGST !== hasGST
    ) {
      await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          hasPST,
          hasGST,
        },
      });
    }

    if (color && existingInventoryItem.color !== color) {
      await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          color,
        },
      });
    }

    const session: any = await getServerSession(req, res, authOptions);
    const employee: any = session?.user;
    const createdBy = `Admin - ${employee.name}`;

    let dbInventoryItemLeft = existingInventoryItem.vendorItem;
    for (const updatedVendorItem of vendorItems) {
      if (updatedVendorItem.id > 0) {
        const existingVendorItem = existingInventoryItem.vendorItem.find(
          (item: any) => item.id === updatedVendorItem.id,
        );

        if (!existingVendorItem) {
          console.error('Vendor Item Not Found');
          continue;
        }

        // Check units and update units
        await checkAndUpdateUnits(
          Number(companyId),
          existingVendorItem.unit,
          updatedVendorItem.units,
          existingVendorItem.id,
          updatedAt,
          createdBy,
        );

        dbInventoryItemLeft = dbInventoryItemLeft.filter(
          (item: any) => item.id !== existingVendorItem.id,
        );
      } else {
        // Case: New Vendor Item
        const newVendorItem = await prisma.vendorItem.create({
          data: {
            inventoryItemId: id,
            vendorId: updatedVendorItem.vendorId,
            quantity: updatedVendorItem.quantity,
            createdAt: updatedAt,
            createdBy,
            companyId: Number(companyId),
          },
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
              createdBy,
              companyId: Number(companyId),
            };
          }),
        });
      }
    }

    // Delete old vendor items
    if (dbInventoryItemLeft.length > 0) {
      const inventoryUnits = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: {
            notIn: dbInventoryItemLeft.map((item: any) => item.id),
          },
          vendorItem: {
            inventoryItemId: existingInventoryItem.id,
          },
        },
      });

      const inventoryUnitsWillBeDeleted = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: {
            in: dbInventoryItemLeft.map((item: any) => item.id),
          },
        },
      });

      // Move all item have inventory unit that will be deleted to first inventory unit
      await prisma.item.updateMany({
        where: {
          inventoryUnitId: {
            in: inventoryUnitsWillBeDeleted.map((item: any) => item.id),
          },
        },
        data: {
          inventoryUnitId: inventoryUnits[0].id,
        },
      });

      // Move all ordered item have inventory unit that will be deleted to first inventory unit
      await prisma.orderedItems.updateMany({
        where: {
          inventoryUnitId: {
            in: inventoryUnitsWillBeDeleted.map((item: any) => item.id),
          },
        },
        data: {
          inventoryUnitId: inventoryUnits[0].id,
        },
      });

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
