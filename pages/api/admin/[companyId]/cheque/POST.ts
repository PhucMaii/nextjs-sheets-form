import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

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

    const { companyId } = req.query;

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

    const session: any = await getServerSession(req, res, authOptions);
    const admin: any = session?.user;

    const { dateAndTime } = getTodayDate();

    const newCheque = await prisma.cheque.create({
      data: {
        fileKeyFront,
        fileKeyBack,
        month,
        year,
        chequeNumber,
        amount,
        userId,
        companyId: Number(companyId),
        createdBy: `Admin - ${admin?.clientName || ''}`,
        createdAt: dateAndTime,
      },
    });

    return res.status(200).json({
      data: newCheque,
      message: 'New Cheque Uploaded Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
