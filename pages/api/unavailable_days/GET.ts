import { DayRange, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { convertToPSTDate, normalizeDate } from '../utils/date';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';

interface IQuery {
  userId?: string;
  date?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId, date }: IQuery = req.query;

    const session: any = await getServerSession(req, res, authOptions);
    const companyId = Number(session?.user?.companyId);

    if (!userId) {
      return res.status(404).json({
        error: 'User Id Is Missing',
      });
    }

    if (userId === 'All Clients' && date) {
      const filteredRange = await getBlockingRangesByDate(companyId, date);

      return res.status(200).json({
        data: filteredRange,
        message: 'Fetch Unavailable Days Ranges Successfully',
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
      include: {
        user: true,
      },
    });

    if (userId !== 'All Clients' && date) {
      const filteredRange = filterRangeByDate(date, unavailableRanges);
      console.log('filteredRange: ', filteredRange);

      console.log(
        'existingUser.clientName: ',
        filteredRange[Object.keys(filteredRange)[0]],
      );

      return res.status(200).json({
        message: 'Fetch Unavailable Days Ranges Successfully',
        data: filteredRange[Object.keys(filteredRange)[0]],
      });
    }

    return res.status(200).json({
      data: [],
      message: 'No Unavailable Days Ranges Found',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const filterRangeByDate = (date: string, rangeList: DayRange[]): Record<string, DayRange[]> => {
  const selectedDate = normalizeDate(new Date(date));

  const rangesInDate = rangeList.filter((range: DayRange) => {
    const pstStartDate = convertToPSTDate(range.startDate);
    const pstEndDate = convertToPSTDate(range.endDate);
    return selectedDate >= pstStartDate && selectedDate <= pstEndDate;
  });

  // Format return result by client
  const formattedResult = rangesInDate.reduce((acc: any, range: any) => {
    const key = `${range.user.clientName} - ${range.user.clientId}`;

    if (!acc[key]) {
      acc[key] = [range];
    } else {
      acc[key] = [...acc[key], range];
    }

    return acc;
  }, {});

  return formattedResult;
};

export const getBlockingRangesByDate = async (
  companyId: number,
  date: string,
) => {
  const allRanges = await prisma.dayRange.findMany({
    where: {
      companyId,
    },
    include: {
      user: true,
    },
  });

  // Formatted Range By Client For Result
  const filteredRange = filterRangeByDate(date, allRanges);

  return filteredRange;
};
