import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';

interface IBody {
  name: string;
  price: number;
  ratio: number;
  vendorItemId: number;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
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

    const session: any = await getServerSession(req, res, authOptions);
    const user: any = session?.user;

    const newUnit = await prisma.inventoryUnit.create({
      data: {
        unit: name,
        ratio,
        unitPrice: price,
        vendorItemId,
        createdAt,
        createdBy: 'Admin - ' + user?.name,
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
