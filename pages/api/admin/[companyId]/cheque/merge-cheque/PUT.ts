import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IBody {
  id: number;
  updatedCheque: {
    fileKeyFront?: string;
    chequeNumber?: string;
    amount?: number;
  };
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, updatedCheque }: IBody = req.body;

    const existingCheque = await prisma.cheque.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingCheque) {
      return res.status(404).json({ error: 'Cheque not found' });
    }

    const updatedChequeData = await prisma.cheque.update({
      where: { id: Number(id) },
      data: { ...updatedCheque },
    });

    return res.status(200).json({
      data: updatedChequeData,
      message: 'Update Cheque Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
