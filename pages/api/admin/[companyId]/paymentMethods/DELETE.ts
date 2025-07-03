import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  methodId?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { methodId }: IQuery = req.query;

    if (!methodId) {
      return res.status(404).json({
        error: 'Payment Method Id is missing',
      });
    }

    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: Number(methodId),
      },
    });

    if (!existingMethod) {
      return res.status(404).json({
        error: 'Payment Method not found',
      });
    }

    await prisma.paymentMethod.delete({
      where: {
        id: Number(methodId),
      },
    });

    return res.status(200).json({
      message: 'Payment Method Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
