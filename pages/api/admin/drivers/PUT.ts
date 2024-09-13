import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  driverId: number;
  updatedName: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { driverId, updatedName }: IBody = req.body;

    if (!driverId || !updatedName) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const existingDriver = await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }

    const sameDriverName = await prisma.driver.findFirst({
        where: {
          name: updatedName,
          id: {
            not: driverId
          }
        },
      });

      if (sameDriverName) {
        return res.status(400).json({
          error: 'Driver Name Existed Already',
        });
      }

    const updatedDriver = await prisma.driver.update({
      where: {
        id: driverId,
      },
      data: {
        name: updatedName,
      },
    });

    return res.status(200).json({
      data: updatedDriver,
      message: 'Update Driver Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
