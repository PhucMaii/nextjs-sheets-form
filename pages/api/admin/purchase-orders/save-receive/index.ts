import { IPOItem } from '@/app/utils/type';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  poId: number;
  poItems: IPOItem[];
}

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { poId, poItems }: IBody = req.body;

    const po = await prisma.pO.findUnique({
      where: { id: poId },
    });

    if (!po) {
      return res.status(404).json({ message: 'PO not found' });
    }

    for (const item of poItems) {
      await prisma.pOItem.update({
        where: { id: item.id },
        data: { receivedQty: item.receivedQty, rejectedQty: item.rejectedQty },
      });
    }

    return res
      .status(200)
      .json({ message: 'Save Items Received Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

export default withAdminAuthGuard(handler);
