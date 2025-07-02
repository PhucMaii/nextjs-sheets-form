import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { normalizeDate } from '../../admin/[companyId]/orders/overview';
import prisma from '@/client';
import { DayRange } from '@prisma/client';
import { convertToPSTDate } from '../../utils/date';
import { filterRangeByDate } from '../GET';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';

interface IQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, date, startDate, endDate }: IQuery = req.query;
    const session: any = await getServerSession(req, res, authOptions);
    const companyId = Number(session?.user?.companyId);

    if (!userId) {
      return res.status(404).json({
        error: 'User Id Is Missing',
      });
    }

    if (userId === 'All Clients' && date) {
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

      return res.status(200).json({
        data: filteredRange,
        message: 'Fetch Unavailable Days Ranges Successfully',
      });
    } else if (startDate && endDate && userId) {
        console.log({startDate, endDate})
      const userBlockDayRanges = await prisma.dayRange.findMany({
        where: {
          userId: Number(userId),
        },
      });

      const filteredRanges = filterRangeByDayRange(
        userBlockDayRanges,
        startDate,
        endDate,
      );

      return res.status(200).json({
        data: filteredRanges,
        message: 'Fetch Unavailable Days Ranges Successfully',
      });
    }
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

const filterRangeByDayRange = (
  ranges: DayRange[],
  startDate: string,
  endDate: string,
) => {
  const formattedStartDate = normalizeDate(new Date(startDate));
  const formattedEndDate = normalizeDate(new Date(endDate));

  const rangesInDate = ranges.filter((range: DayRange) => {
    const pstStartDate = convertToPSTDate(range.startDate);
    const pstEndDate = convertToPSTDate(range.endDate);

    // if startDate overlap, return true
    if (pstStartDate >= formattedStartDate && pstStartDate <= formattedEndDate) {
        return true;
    }

    // if end date overlap, return true
    if (pstEndDate >= formattedStartDate && pstEndDate <= formattedEndDate) {
        return true;
    }

    return false;
    

  });

  return rangesInDate;
};

export default withAdminAuthGuard(handler);