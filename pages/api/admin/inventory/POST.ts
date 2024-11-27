import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';

interface IBody {
  name: string;
  vendorIds: number[];
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name, vendorIds, createdAt }: IBody = req.body;

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

    // Create Main Inventory Item
    const newInventory = await prisma.inventoryItem.create({
      data: {
        name,
        createdAt,
        createdBy: `Admin - ${user.clientName}`,
      },
    });

    // Create Vendor Item
    const newVendorItems = vendorIds.map((vendorId: number) => {
      return {
        inventoryItemId: newInventory.id,
        vendorId,
        quantity: 0,
        createdAt,
        createdBy: `Admin - ${user.clientName}`,
      };
    });

    await prisma.vendorItem.createMany({
      data: newVendorItems,
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
