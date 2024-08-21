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
        error: 'User Id Is Missing',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!existingUser) {
      return res.status(400).json({
        error: 'User Does Not Exist',
      });
    }

    const unavailableRanges = await prisma.dayRange.findMany({
      where: {
        userId: existingUser.id,
      },
    });

    return res.status(200).json({
      message: 'Fetch Unavailable Days Ranges Successfully',
      data: unavailableRanges,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
