import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleCheckRangeValid } from './POST';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
// import { convertToPSTDate } from '../utils/date';

interface IBody {
  updatedRangeId: number;
  startDate: Date;
  endDate: Date;
  userId: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { updatedRangeId, startDate, endDate, userId }: IBody = req.body;

    const session: any = await getServerSession(req, res, authOptions);
    const companyId = Number(session?.user?.companyId);

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

    // Check is same start date or same end date exist
    const isRangeValid = await handleCheckRangeValid(
      companyId,
      startDate,
      endDate,
      userId,
      updatedRangeId,
    );
    if (!isRangeValid.isValid) {
      return res.status(400).json({
        error: isRangeValid.message,
      });
    }

    // const pstStartDate = convertToPSTDate(startDate);
    // const pstEndDate = convertToPSTDate(endDate);
    const utcStartDate = new Date(startDate);
    const utcEndDate = new Date(endDate);

    const updatedUnavailableRange = await prisma.dayRange.update({
      where: {
        id: updatedRangeId,
      },
      data: {
        startDate: utcStartDate,
        endDate: utcEndDate,
      },
    });

    return res.status(201).json({
      data: updatedUnavailableRange,
      message: 'Update Unavailable Range Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}
