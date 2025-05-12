import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '@/pages/api/utils/auth';

interface IBody {
  name: string;
  price: number;
  ratio: number;
  vendorItemId: number;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name, price, ratio, vendorItemId, createdAt }: IBody = req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }

    const sameRatioUnit = await prisma.inventoryUnit.findFirst({
      where: {
        vendorItemId,
        ratio,
      },
    });

    if (sameRatioUnit) {
      return res.status(400).json({
        error: 'Unit with same ratio already exists',
      });
    }

    const sameNameUnit = await prisma.inventoryUnit.findFirst({
      where: {
        vendorItemId,
        unit: name,
      },
    });

    if (sameNameUnit) {
      return res.status(400).json({
        error: 'Unit with same name already exists',
      });
    }

    const user = await getUserInfo(req, res);

    const newUnit = await prisma.inventoryUnit.create({
      data: {
        unit: name,
        ratio,
        unitPrice: price,
        vendorItemId,
        createdAt,
        createdBy: 'Admin - ' + user?.clientName,
        companyId: Number(companyId),
      },
    });

    return res.status(201).json({
      data: newUnit,
      message: 'Unit Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
