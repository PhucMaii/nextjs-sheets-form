import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import { infoBackground } from '@/theme/color';
import { otherTypeId } from '@/app/lib/constant';
import { calculateNextIndexPosAndRows } from '../../utils/appearance';

interface IBody {
  name: string;
  sku: string;
  supplierSku: string;
  typeId: number;
  hasPST: boolean;
  hasGST: boolean;
  vendorItems: any[];
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name, sku, supplierSku, typeId, hasPST, hasGST, vendorItems, createdAt }: IBody =
      req.body;

    const vendorIds = vendorItems.map((vendorItem: any) => {
      return vendorItem.vendorId;
    });

    const existingVendors = await prisma.vendor.findMany({
      where: {
        id: {
          in: vendorIds,
        },
      },
    });

    if (existingVendors.length !== vendorIds.length) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const user: any = await getUserInfo(req, res);
    const createdBy = `Admin - ${user.clientName}`;

    // Check has name existed
    const sameNameInventory = await prisma.inventoryItem.findFirst({
      where: {
        name,
      },
    });

    if (sameNameInventory) {
      return res.status(500).json({
        error: 'Inventory Name Existed',
      });
    }

    const { nextPos, newRows } = await calculateNextIndexPosAndRows(typeId, 1);

    // Create Main Inventory Item
    const newInventory = await prisma.inventoryItem.create({
      data: {
        name,
        supplierSku,
        sku,
        hasPST,
        hasGST,
        createdAt,
        createdBy,
        color: infoBackground,
        typeId: typeId > 0 ? typeId : otherTypeId,
        indexPos: nextPos[0],
      },
    });

    // Update Rows in Item Type
    await prisma.itemType.update({
      where: {
        id: typeId,
      },
      data: {
        rows: newRows,
      },
    });

    // Create Vendor Item
    const newVendorItems = vendorIds.map((vendorId: number) => {
      return {
        inventoryItemId: newInventory.id,
        vendorId,
        quantity: 0,
        createdAt,
        createdBy,
      };
    });

    await prisma.vendorItem.createMany({
      data: newVendorItems,
    });

    const createdVendorItems = await prisma.vendorItem.findMany({
      where: {
        inventoryItemId: newInventory.id,
      },
      include: {
        vendor: true,
      },
    });

    // Create inventory unit
    const newUnits = vendorItems.flatMap((vendorItem: any) => {
      const targetVendorItem = createdVendorItems.find(
        (item: any) => item.vendorId === vendorItem.vendorId,
      );

      if (!targetVendorItem) {
        console.error(
          `Conflict Vendor Item not found for vendorItem ID: ${vendorItem.id}`,
        );
        return []; // Skip this vendorItem by returning an empty array
      }

      return vendorItem.units.map((unit: any) => {
        return {
          vendorItemId: targetVendorItem.id,
          unit: unit.unit,
          ratio: unit.ratio,
          unitPrice: unit.unitPrice,
          createdAt,
          createdBy,
        };
      });
    });

    await prisma.inventoryUnit.createMany({
      data: newUnits,
    });

    return res.status(201).json({
      data: newInventory,
      message: 'Inventory Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
