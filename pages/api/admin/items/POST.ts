import { IItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits } from '../inventory/expenses/POST';
import { getUserInfo } from '../../utils/auth';

interface IBody {
  newItem: IItem;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { newItem, createdAt }: IBody = req.body;

    const isItemValid: any = await checkIsItemValid(newItem);

    if (!isItemValid.check) {
      return res.status(500).json({
        error: isItemValid.message,
      });
    }

    // Check and Update Units

    const selectedInvetoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: newItem.inventoryItemId,
      },
      include: {
        vendorItem: {
          include: {
            unit: true,
          }
        },

      }
    });

    if (!selectedInvetoryItem) {
      return res.status(500).json({
        error: 'Inventory Item Not Found',
      });
    }

    const user = await getUserInfo(req, res);
    const createdBy = `Admin - ${user?.clientName}`;

    for (const vItem of selectedInvetoryItem.vendorItem) {
      const clientVendorItemUnits = newItem.units.filter((unit: any) => unit.vendorItemId === vItem.id);

      await checkAndUpdateUnits(vItem.unit, clientVendorItemUnits, vItem.id, createdAt, createdBy);
    }

    // Brand New Unit
    const brandNewUnit = newItem.units.filter((unit: any) => unit.vendorItemId < 1);

    if (brandNewUnit.length > 0) {
      await prisma.inventoryUnit.createMany({
        data: brandNewUnit.map((unit: any) => {
          return {
            vendorItemId: selectedInvetoryItem.vendorItem[0].id,
            unit: unit.unit,
            ratio: unit.ratio,
            unitPrice: unit.unitPrice,
            createdAt,
            createdBy
          }
        })
      })
    }

    let selectedUnit = await prisma.inventoryUnit.findFirst({
      where: {
        vendorItemId: newItem.unit.vendorItemId,
        unit: newItem.unit.unit,
        ratio: newItem.unit.ratio,
        unitPrice: newItem.unit.unitPrice,
      },
    });

    // If user choose brand new unit as primary unit
    if (newItem.unit.vendorItemId < 1) {
      selectedUnit = newItem.unit;
    }


    if (!selectedUnit) {
      return res.status(500).json({
        error: 'Conflict Unit Not Found',
      });
    }

    const createdItem = await prisma.item.create({
      data: {
        name: newItem.name,
        categoryId: newItem.categoryId,
        price: newItem.price,
        availability: newItem?.availability || true,
        inventoryItemId: newItem?.inventoryItemId || null,
        inventoryUnitId: selectedUnit.id,
      },
    });

    return res.status(201).json({
      data: createdItem,
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
    const prisma = new PrismaClient();

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
