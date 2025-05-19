import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  driverId?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { driverId }: IQuery = req.query;

    if (!driverId) {
      return res.status(404).json({
        error: 'You are missing driver id',
      });
    }

    const existingDriver = await prisma.employee.findUnique({
      where: {
        id: Number(driverId),
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }

    await prisma.employee.delete({
      where: {
        id: existingDriver.id,
      },
    });

    return res.status(200).json({
      message: 'Delete Driver Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
