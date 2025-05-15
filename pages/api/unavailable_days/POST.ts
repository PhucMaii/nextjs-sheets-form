import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo, getUserInfo } from '../utils/auth';
import { formatDateString } from '../utils/date';
import { generateListOfDateString } from '@/app/utils/time';

const prisma = new PrismaClient();

interface IBody {
  startDate: string;
  endDate: string;
  userId: number;
  createdAt: string;
  role: USER_ROLE;
  companyId: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate, userId, createdAt, role, companyId }: IBody =
      req.body;

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
      const admin: any = await getUserInfo(req, res);
      createdBy = `Admin - ${admin?.clientName}`;
    } else if (role === USER_ROLE.SUPER_ADMIN) {
      const admin: any = await getUserInfo(req, res);
      createdBy = `S Admin - ${admin?.clientName}`;
    }

    // Check is same start date or same end date exist
    const isRangeValid = await handleCheckRangeValid(
      companyId,
      startDate,
      endDate,
      userId,
    );

    if (!isRangeValid.isValid) {
      return res.status(400).json({
        error: isRangeValid.message,
      });
    }

    // Check if order exist
    const orders = await getOrdersByDateRange(startDate, endDate, userId);

    if (orders.length > 0) {
      return res.status(200).json({
        error: 'Order Exist',
        data: orders,
      });
    }
    // const pstStartDate = convertToPSTDate(startDate);
    // const pstEndDate = convertToPSTDate(endDate);

    const utcStartDate = new Date(startDate);
    const utcEndDate = new Date(endDate);

    const newUnavailableRange = await prisma.dayRange.create({
      data: {
        startDate: utcStartDate,
        endDate: utcEndDate,
        userId,
        createdAt,
        createdBy,
        companyId,
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

export const getOrdersByDateRange = async (
  startDate: Date | string,
  endDate: Date | string,
  userId: number,
) => {
  const normalizeStartDate = formatDateString(startDate);
  const normalizeEndDate = formatDateString(endDate);

  const listOfDates = generateListOfDateString(
    new Date(normalizeStartDate),
    new Date(normalizeEndDate),
  );

  console.log({
    startDate,
    endDate,
    normalizeStartDate,
    normalizeEndDate,
    listOfDates,
  });
  const orders = await prisma.orders.findMany({
    where: {
      deliveryDate: {
        in: listOfDates,
      },
      userId,
      status: {
        not: ORDER_STATUS.VOID,
      },
    },
    include: {
      user: {
        include: {
          routes: {
            include: {
              route: {
                include: {
                  driver: true,
                },
              },
            },
          },
          preference: true,
          category: true,
        },
      },
      items: {
        include: {
          inventoryItem: true,
          inventoryUnit: true,
          fifo: true,
        },
      },
    },
  });

  return orders;
};

export const handleCheckRangeValid = async (
  companyId: number,
  startDate: Date | string,
  endDate: Date | string,
  userId: number,
  avoidId: number = 0,
) => {
  const sameStartDate = await prisma.dayRange.findFirst({
    where: {
      companyId,
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
      companyId,
      endDate,
      userId,
    },
  });

  if (sameEndDate) {
    return { isValid: false, message: 'Unavaiable End Date Exists Already' };
  }

  return { isValid: true, message: 'Range Valid' };
};
