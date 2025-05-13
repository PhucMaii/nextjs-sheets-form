import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  driverId: number;
  employeeCode: string;
  hourlyRate: number;
  updatedName: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { driverId, employeeCode, hourlyRate, updatedName }: IBody = req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (!driverId || !updatedName) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const existingDriver = await prisma.employee.findUnique({
      where: {
        id: driverId,
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }

    const sameDriverName = await prisma.employee.findFirst({
      where: {
        name: updatedName,
        id: {
          not: driverId,
        },
        role: USER_ROLE.DRIVER,
      },
    });

    if (sameDriverName) {
      return res.status(400).json({
        error: 'Driver Name Existed Already',
      });
    }

    const updatedDriver = await prisma.employee.update({
      where: {
        id: driverId,
      },
      data: {
        name: updatedName,
        hourlyRate,
        employeeCode,
      },
    });

    return res.status(200).json({
      data: updatedDriver,
      message: 'Update Driver Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
