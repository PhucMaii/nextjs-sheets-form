import { IItem } from '@/app/utils/type';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits } from '../inventory/expenses/POST';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';

interface IBody {
  newItem: IItem;
  createdAt: string;
  categoryIds: number[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    const { newItem, createdAt, categoryIds }: IBody = req.body;

    const isItemValid: any = await checkIsItemValid(newItem);

    if (!isItemValid.check) {
      return res.status(500).json({
        error: isItemValid.message,
      });
    }

    // Check and Update Units

    const selectedInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: newItem.inventoryItemId,
      },
      include: {
        vendorItem: {
          include: {
            unit: true,
          },
        },
      },
    });

    if (!selectedInventoryItem) {
      return res.status(500).json({
        error: 'Inventory Item Not Found',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);
    const user: any = session?.user;
    const createdBy = `Admin - ${user?.name}`;

    for (const vItem of selectedInventoryItem.vendorItem) {
      const clientVendorItemUnits = newItem.units.filter(
        (unit: any) => unit.vendorItemId === vItem.id,
      );

      await checkAndUpdateUnits(
        Number(companyId),
        vItem.unit,
        clientVendorItemUnits,
        vItem.id,
        createdAt,
        createdBy,
      );
    }

    // Brand New Unit
    const brandNewUnit = newItem.units.filter(
      (unit: any) => unit.vendorItemId < 1,
    );

    if (brandNewUnit.length > 0) {
      await prisma.inventoryUnit.createMany({
        data: brandNewUnit.map((unit: any) => {
          return {
            vendorItemId: selectedInventoryItem.vendorItem[0].id,
            unit: unit.unit,
            ratio: unit.ratio,
            unitPrice: unit.unitPrice,
            createdAt,
            createdBy,
            companyId: Number(companyId),
          };
        }),
      });
    }

    const selectedUnit = await prisma.inventoryUnit.findFirst({
      where: {
        vendorItemId:
          newItem.unit.vendorItemId < 1
            ? selectedInventoryItem.vendorItem[0].id
            : newItem.unit.vendorItemId,
        unit: newItem.unit.unit,
        ratio: newItem.unit.ratio,
        unitPrice: newItem.unit.unitPrice,
        companyId: Number(companyId),
      },
    });

    if (!selectedUnit) {
      return res.status(500).json({
        error: 'Conflict Unit Not Found',
      });
    }

    const sellingItems = await prisma.item.findMany({
      where: {
        companyId: Number(companyId),
        categoryId: {
          in: categoryIds,
        },
      },
    });

    const newItemsInMultiCategory: any = categoryIds
      .map((categoryId: number) => {
        // Check if item already exist in that category
        const isItemExist = sellingItems.find((item: any) => {
          return (
            item.categoryId === categoryId &&
            item.inventoryItemId === newItem?.inventoryItemId
          );
        });

        if (isItemExist) {
          return null;
        }

        return {
          name: newItem.name,
          price: newItem.price,
          availability: newItem?.availability || true,
          inventoryItemId: newItem?.inventoryItemId || null,
          inventoryUnitId: selectedUnit.id,
          categoryId,
          companyId: Number(companyId),
        };
      })
      .filter((item: any) => {
        return item !== null;
      });

    await prisma.item.createMany({
      data: newItemsInMultiCategory,
    });

    return res.status(201).json({
      message: 'Item Created Succesfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

const checkIsItemValid = async (newItem: IItem) => {
  try {
    // * BAD CASE
    // Check is new name valid
    let inventoryItemExists: any = [];
    if (newItem.inventoryItemId) {
      inventoryItemExists = await prisma.item.findMany({
        where: {
          categoryId: newItem.categoryId,
          inventoryItemId: newItem?.inventoryItemId,
        },
      });
    } else {
      inventoryItemExists = await prisma.item.findMany({
        where: {
          categoryId: newItem.categoryId,
          name: newItem.name,
        },
      });
    }

    if (inventoryItemExists.length > 0) {
      return { check: false, message: 'Inventory Item Already Existed' };
    }

    return { check: true };
  } catch (error: any) {
    console.log('Internal Server Error in checking item: ', error);
    return {
      check: false,
      message: 'Internal SServer Error in checking item: ' + error,
    };
  }
};
