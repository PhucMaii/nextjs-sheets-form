import { IBoard } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { drive } from 'googleapis/build/src/apis/drive';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { updatedBoard }: { updatedBoard: IBoard } = req.body;

    const isDriverInValid = await checkIsDriverInDate(
      updatedBoard.date,
      updatedBoard.driverId,
    );

    if (!isDriverInValid) {
      return res.status(500).json({
        error: `Driver ${updatedBoard.driver.name} already in process for ${updatedBoard.date}`,
      });
    }

    const updatedCodBoard = await prisma.codBoard.update({
      where: {
        id: updatedBoard.id,
      },
      data: {
        date: updatedBoard.date,
        cash: updatedBoard.cash,
        driverId: updatedBoard.driverId,
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
