import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits } from '../../inventory/expenses/POST';
import { getTodayDate } from '@/pages/api/utils/date';
import { getUserInfo } from '@/pages/api/utils/auth';
import prisma from '@/client';

interface IBody {
  id: number;
  inventoryItemId: number;
  name: string;
  units: any;
  inventoryUnitId: number;
  image: string;
  description: string;
  price: number;
  isShowDiscount?: boolean;
  prevPrice?: number;
  isBestSeller: boolean;
  typeId: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId }: any = req.query;
    
    const {
      id,
      inventoryItemId,
      name,
      units,
      inventoryUnitId,
      image,
      description,
      price,
      isShowDiscount,
      prevPrice,
      isBestSeller,
      typeId,
    }: IBody = req.body;

    const existingPreference = await prisma.itemPreference.findUnique({
      where: {
        id,
      },
    });

    if (!existingPreference) {
      return res.status(404).json({ error: 'Item preference not found' });
    }

    // Check if inventoryItemid  exists in typeId already
    // const existingInventoryItemAndType = await prisma.itemPreference.findFirst({
    //   where: {
    //     id: {
    //       not: id,
    //     },
    //     typeId: typeId,
    //     inventoryItemId: inventoryItemId,
    //   },
    // });

    // if (existingInventoryItemAndType) {
    //   return res
    //     .status(400)
    //     .json({ error: 'Item already exists in this type' });
    // }

    // Update if any units are added or removed or modified
    if (units) {
      const selectedUnit = await prisma.inventoryUnit.findUnique({
        where: {
          id: inventoryUnitId,
        },
      });

      if (!selectedUnit) {
        return res.status(404).json({ error: 'Unit not found' });
      }

      const dbUnits = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: selectedUnit?.vendorItemId,
        },
      });

      const { date, time } = getTodayDate();
      const admin: any = await getUserInfo(req, res);

      await checkAndUpdateUnits(
        companyId,
        dbUnits,
        units,
        selectedUnit.vendorItemId,
        `${date} ${time}`,
        `Admin - ${admin.clientName}`,
      );
    }

    console.log(inventoryUnitId, 'inventoryUnitId');

    await prisma.itemPreference.update({
      where: {
        id,
      },
      data: {
        inventoryItemId: inventoryItemId,
        image: image,
        name: name,
        inventoryUnitId: inventoryUnitId,
        description: description,
        price,
        isShowDiscount: isShowDiscount,
        prevPrice: prevPrice,
        isBestSeller: isBestSeller,
        typeId: typeId,
      },
    });

    return res
      .status(200)
      .json({ message: 'Item preference updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
