import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';

interface IBody {
  fileKeyFront: string;
  fileKeyBack: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  year: string;
  chequeNumber: string;
  amount: number;
  userId: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    const {
      fileKeyFront,
      fileKeyBack,
      month,
      startDate,
      endDate,
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
        month: month || null,
        startDate: startDate || null,
        endDate: endDate || null,
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
