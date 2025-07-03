import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Shift Id Not Provided',
      });
    }

    const existingShift = await prisma.shiftSession.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingShift) {
      return res.status(404).json({
        error: 'Shift Not Found',
      });
    }

    await prisma.shiftSession.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: 'Shift Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
