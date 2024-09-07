import { DayRange, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  userId?: string;
  date?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId, date }: IQuery = req.query;

    if (!userId) {
      return res.status(404).json({
        error: 'User Id Is Missing',
      });
    }

    if (userId === 'All Clients' && date) {
      const allRanges = await prisma.dayRange.findMany({
        include: {
          user: true,
        },
      });

      // Formatted Range By Client For Result
      const filteredRange = filterRangeByDate(date, allRanges);

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

const filterRangeByDate = (date: string, rangeList: DayRange[]) => {
  const selectedDate = new Date(date);

  // Filter range that include the selected date
  const rangesInDate = rangeList.filter((range: DayRange) => {
    const endDate = new Date(range.endDate);
    endDate.setDate(range.endDate.getDate() - 1);
    return selectedDate >= range.startDate && selectedDate <= endDate;
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
