import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { USER_ROLE } from '@/app/utils/enum';
import { generateEmployeeCode } from '@/pages/api/utils/drivers';

interface IBody {
  employeeCode: string;
  driverName: string;
  driverPassword: string;
  hourlyRate: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { employeeCode, driverName, driverPassword, hourlyRate }: IBody =
      req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const sameDriverName = await prisma.employee.findFirst({
      where: {
        name: driverName,
        role: USER_ROLE.DRIVER,
      },
    });

    if (sameDriverName) {
      return res.status(400).json({
        error: 'Driver Name Existed Already',
      });
    }

    let code: string = employeeCode || generateEmployeeCode();

    // Check if the employee code is already in use
    while (code) {
      const sameEmployeeCode = await prisma.employee.findFirst({
        where: {
          employeeCode: code.toString(),
        },
      });

      if (sameEmployeeCode) {
        code = generateEmployeeCode();
      } else {
        break;
      }
    }

    const hashPassword = await bcrypt.hash(driverPassword, 12);

    const newDriver = await prisma.employee.create({
      data: {
        name: driverName,
        employeeCode: code,
        password: hashPassword,
        hourlyRate,
        role: USER_ROLE.DRIVER,
        companyId: Number(companyId),
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
