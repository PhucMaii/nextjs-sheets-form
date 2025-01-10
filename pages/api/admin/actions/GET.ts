import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  name?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name }: IQuery = req.query;

    const actions = await prisma.action.findMany({
      where: {
        name,
      },
    });

    return res.status(200).json({
      data: actions,
      message: 'Fetch Actions Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
