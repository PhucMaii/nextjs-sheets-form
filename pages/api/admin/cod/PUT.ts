import { IBoard } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, updatedBoard }: { id: number; updatedBoard: any } = req.body;

    const isDriverValid = await checkIsDriverInDate(
      updatedBoard.date,
      updatedBoard.driverId,
    );

    if (!isDriverValid) {
      return res.status(500).json({
        error: `Driver ${updatedBoard.driverId} already in process for ${updatedBoard.date}`,
      });
    }

    const updatedCodBoard = await prisma.codBoard.update({
      where: {
        id,
      },
      data: {
        ...updatedBoard,
      },
    });

    return res.status(200).json({
      message: 'COD Board Updated Successfully',
      data: updatedCodBoard,
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const checkIsDriverInDate = async (date: string, driverId: number) => {
  const prisma = new PrismaClient();
  const existedDriverInDate = await prisma.codBoard.findMany({
    where: {
      date,
      driverId,
    },
  });
  return existedDriverInDate.length > 0;
};
