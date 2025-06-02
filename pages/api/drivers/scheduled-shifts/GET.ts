import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { formatDate } from '../../utils/date';
import { generateListOfDateString } from '@/app/utils/time';

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startedDate, endedDate } = req.query;

    const formattedStartedDate = formatDate(startedDate as string);
    const formattedEndedDate = formatDate(endedDate as string);

    const listOfDates = generateListOfDateString(
      formattedStartedDate,
      formattedEndedDate,
    );

    console.log({startedDate, endedDate, listOfDates});

    const shifts = await prisma.scheduledShift.findMany({
      where: {
        employeeId: session.user.id,
        queryDate: {
          in: listOfDates,
        },
      },
      include: {
        employee: true,
      },
    });

    res
      .status(200)
      .json({ message: 'Scheduled shifts fetched successfully', data: shifts });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
