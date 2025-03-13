import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import { getTodayDate } from '../../utils/date';

interface IBody {
    fileKeyFront: string;
    fileKeyBack: string;
    month: string;
    year: string;
    chequeNumber: string;
    amount: number;
    userId: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      fileKeyFront,
      fileKeyBack,
      month,
      year,
      chequeNumber,
      amount,
      userId,
    }: IBody = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    const admin: any = await getUserInfo(req, res);
    const createdAt = getTodayDate();

    const newCheque = await prisma.cheque.create({
      data: {
        fileKeyFront,
        fileKeyBack,
        month,
        year,
        chequeNumber,
        amount,
        userId,
        createdBy: `Admin - ${admin?.clientName || ''}`,

      },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
