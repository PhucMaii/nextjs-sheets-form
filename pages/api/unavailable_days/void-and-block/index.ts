import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { getTodayDate } from '../../utils/date';
import { getDriverInfo, getUserInfo } from '../../utils/auth';
import withAuthGuard from '../../utils/withAuthGuard';

interface IBody {
  orderIds: number[];
  startDate: Date;
  endDate: Date;
  userId: number;
  role: USER_ROLE;
}

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
      });
    }

    const { orderIds, startDate, endDate, userId, role }: IBody = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    const orders = await prisma.orders.findMany({
      where: {
        id: { in: orderIds },
      },
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        error: 'Some orders not found',
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

    // Void orders
    await prisma.orders.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        status: ORDER_STATUS.VOID,
        isVoid: role === USER_ROLE.DRIVER ? true : false,
        updatedBy: createdBy,
      },
    });

    // Block date range
    const utcStartDate = new Date(startDate);
    const utcEndDate = new Date(endDate);

    const today = getTodayDate();

    const newUnavailableRange = await prisma.dayRange.create({
      data: {
        startDate: utcStartDate,
        endDate: utcEndDate,
        userId,
        createdAt: today.dateAndTime,
        createdBy,
      },
    });

    return res.status(200).json({
      message: 'Orders voided successfully',
      data: newUnavailableRange,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAuthGuard(handler);
