import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export const getUserInfo = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const prisma = new PrismaClient();

    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({
        error: 'You are not authenticated',
      });
    }

    const userInfo = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (!userInfo) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    return userInfo;
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export const getDriverInfo = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const prisma = new PrismaClient();

    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({
        error: 'You are not authenticated',
      });
    }

    const driverInfo = await prisma.driver.findUnique({
      where: {
        id: Number(session.user.id),
      },
      include: {
        routes: true,
      },
    });

    if (!driverInfo) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    return driverInfo;
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};
