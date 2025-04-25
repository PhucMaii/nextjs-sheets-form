import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query as IQuery;

    if (!id) {
      return res.status(400).json({ message: 'Purchase order ID is required' });
    }

    const existingPo = await prisma.pO.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPo) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const po = await prisma.pO.delete({ where: { id: Number(id) } });

    return res
      .status(200)
      .json({ message: 'Purchase order deleted successfully', po });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return res.status(500).json({ message: error.message });
  }
}
