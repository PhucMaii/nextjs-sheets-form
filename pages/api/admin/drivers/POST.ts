import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { USER_ROLE } from '@/app/utils/enum';

interface IBody {
  employeeName: string;
  employeePassword: string;
  hourlyRate: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { employeeName, employeePassword, hourlyRate }: IBody = req.body;

    const sameEmployeeName = await prisma.employee.findFirst({
      where: {
        name: employeeName,
      },
    });

    if (sameEmployeeName) {
      return res.status(400).json({
        error: 'Employee Name Existed Already',
      });
    }

    const hashPassword = await bcrypt.hash(employeePassword, 12);

    const newEmployee = await prisma.employee.create({
      data: {
        name: employeeName,
        password: hashPassword,
        hourlyRate,
        role: USER_ROLE.DRIVER,
      },
    });

    return res.status(201).json({
      data: newEmployee,
      message: 'Employee Added Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
