import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { infoBackground } from '@/theme/color';
import { otherTypeId } from '@/app/lib/constant';
import { calculateNextIndexPosAndRows } from '@/pages/api/utils/appearance';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { USER_ROLE } from '@/app/utils/enum';

interface IBody {
  name: string;
  sku: string;
  // supplierSku: string;
  typeId: number;
  hasPST: boolean;
  hasGST: boolean;
  isShowInventory: boolean;
  vendorItems: any[];
  sellingItems?: any[];
  isInternal?: boolean;
}

interface IQuery {
  companyId?: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      name,
      sku,
      // supplierSku,
      typeId,
      hasPST,
      hasGST,
      isShowInventory,
      vendorItems,
      sellingItems,
      isInternal,
    }: IBody = req.body;

    const { companyId }: IQuery = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const vendorIds = vendorItems.map((vendorItem: any) => {
      return vendorItem.vendorId;
    });

    const existingVendors = await prisma.vendor.findMany({
      where: {
        companyId: Number(companyId),
        id: {
          in: vendorIds,
        },
      },
    });

    if (existingVendors.length !== vendorIds.length) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    const today = getTodayDate();
    const createdAt = today.dateAndTime;

    // Check has name existed
    const sameNameInventory = await prisma.inventoryItem.findFirst({
      where: {
        name,
        companyId: Number(companyId),
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
        isInternal,
        // supplierSku,
        sku,
        hasPST,
        hasGST,
        isShowInventory,
        createdAt,
        createdBy,
        color: infoBackground,
        typeId: typeId > 0 ? typeId : otherTypeId,
        indexPos: nextPos[0],
        companyId: Number(companyId),
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
    const newVendorItems = vendorItems.map((vendorItem: any) => {
      return {
        inventoryItemId: newInventory.id,
        vendorId: vendorItem.vendorId,
        quantity: 0,
        supplierSku: vendorItem.supplierSku,
        createdAt,
        createdBy,
        companyId: Number(companyId),
      };
    });

    await prisma.vendorItem.createMany({
      data: newVendorItems,
    });

    const createdVendorItems = await prisma.vendorItem.findMany({
      where: {
        companyId: Number(companyId),
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
          companyId: Number(companyId),
        };
      });
    });

    await prisma.inventoryUnit.createMany({
      data: newUnits,
    });

    const justCreatedUnits = await prisma.inventoryUnit.findMany({
      where: {
        companyId: Number(companyId),
        createdAt,
      },
    });

    if (sellingItems && sellingItems.length > 0) {
      // Create Selling Items
      const newSellingItems = sellingItems.map((sellingItem: any) => {
        const targetUnit = justCreatedUnits.find(
          (unit: any) =>
            unit.unit === sellingItem.inventoryUnit.unit &&
            unit.ratio === sellingItem.inventoryUnit.ratio &&
            unit.unitPrice === sellingItem.inventoryUnit.unitPrice,
        );

        if (!targetUnit) {
          console.error(
            `Conflict Unit not found for sellingItem ID: ${sellingItem.id}`,
          );
          return null; // Skip this sellingItem by returning null
        }

        return {
          inventoryItemId: newInventory.id,
          categoryId: sellingItem.categoryId,
          name: sellingItem.name,
          price: sellingItem.price,
          inventoryUnitId: targetUnit.id,
          isShowDiscount: sellingItem.isShowDiscount,
          prevPrice: sellingItem.prevPrice,
          availability: true,
          createdAt,
          createdBy,
          companyId: Number(companyId),
        };
      });

      await prisma.item.createMany({
        data: newSellingItems.filter((item: any) => item !== null) as any,
      });
    }

    return res.status(201).json({
      data: newInventory,
      message: 'Inventory Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
