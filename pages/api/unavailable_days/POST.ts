import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../utils/auth';

interface IBody {
  startDate: Date;
  endDate: Date;
  userId: number;
  createdAt: string;
  role: USER_ROLE;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { startDate, endDate, userId, createdAt, role }: IBody = req.body;

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

    let createdBy = role.charAt(0).toUpperCase() + role.slice(1);

    if (role === USER_ROLE.CLIENT) {
      createdBy = `Client - ${existingUser.clientName}`;
    } else if (role === USER_ROLE.DRIVER) {
      const driver: any = await getDriverInfo(req, res);
      createdBy = driver.name;
    } else if (role === USER_ROLE.ADMIN) {
      createdBy = `Admin - ${existingUser.clientName}`;
    } else if (role === USER_ROLE.SUPER_ADMIN) {
      createdBy = `S Admin - ${existingUser.clientName}`;
    }

    // Check is same start date or same end date exist
    const isRangeValid = await handleCheckRangeValid(
      prisma,
      startDate,
      endDate,
      userId,
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

    // console.log({
    //   startDate,
    //   endDate,
    //   pstStartDate,
    //   pstEndDate,
    // });

    const newUnavailableRange = await prisma.dayRange.create({
      data: {
        startDate: utcStartDate,
        endDate: utcEndDate,
        userId,
        createdAt,
        createdBy,
      },
    });

    return res.status(201).json({
      data: newUnavailableRange,
      message: 'Add Unavailable Range Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

export const handleCheckRangeValid = async (
  prisma: PrismaClient,
  startDate: Date,
  endDate: Date,
  userId: number,
  avoidId: number = 0,
) => {
  const sameStartDate = await prisma.dayRange.findFirst({
    where: {
      id: {
        not: avoidId,
      },
      startDate,
      userId,
    },
  });

  if (sameStartDate) {
    return { isValid: false, message: 'Unavaiable Start Date Exists Already' };
  }

  const sameEndDate = await prisma.dayRange.findFirst({
    where: {
      endDate,
      userId,
    },
  });

  if (sameEndDate) {
    return { isValid: false, message: 'Unavaiable End Date Exists Already' };
  }

  return { isValid: true, message: 'Range Valid' };
};
