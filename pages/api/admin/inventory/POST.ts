import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';

interface IBody {
  name: string;
  vendorId: number;
  quantity: number;
  unitPrice: number;
  unit: string;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name, vendorId, quantity, unitPrice, unit, createdAt }: IBody =
      req.body;

    const existingVendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
    });

    if (!existingVendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const user: any = await getUserInfo(req, res);

    const newInventory = await prisma.inventoryItem.create({
      data: {
        name,
        vendorId,
        quantity,
        unitPrice,
        unit,
        createdAt,
        createdBy: `Admin - ${user.clientName}`,
      },
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
