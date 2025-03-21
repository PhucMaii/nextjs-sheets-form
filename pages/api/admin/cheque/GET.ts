import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  userId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId }: IQuery = req.query;

    if (!userId) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    const cheques = await prisma.cheque.findMany({
      where: {
        userId: Number(userId),
      },
    });

    return res.status(200).json({
      data: cheques,
      message: 'Fetch User Cheques Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
