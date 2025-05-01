import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { USER_ROLE } from '@/app/utils/enum';

interface IBody {
  driverName: string;
  driverPassword: string;
  hourlyRate: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { driverName, driverPassword, hourlyRate }: IBody = req.body;

    const sameDriverName = await prisma.driver.findFirst({
      where: {
        name: driverName,
      },
    });

    if (sameDriverName) {
      return res.status(400).json({
        error: 'Driver Name Existed Already',
      });
    }

    const hashPassword = await bcrypt.hash(driverPassword, 12);

    const newDriver = await prisma.driver.create({
      data: {
        name: driverName,
        password: hashPassword,
        hourlyRate,
        role: USER_ROLE.DRIVER,
      },
    });

    return res.status(201).json({
      data: newDriver,
      message: 'Driver Added Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
