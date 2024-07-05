import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Driver Id Not Provided',
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!driver) {
      return res.status(500).json({
        error: 'Driver Not Found',
      });
    }

    return res.status(200).json({
      data: driver,
      message: 'Fetch Driver Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
