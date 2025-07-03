import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { generateEmployeeCode } from '@/pages/api/utils/drivers';
import prisma from '@/client';

interface IBody {
  employeeCode: string;
  driverName: string;
  driverPassword: string;
  payRate: number;
  role: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { employeeCode, driverName, driverPassword, payRate, role }: IBody =
      req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const sameDriverName = await prisma.employee.findFirst({
      where: {
        name: driverName,
        // role: USER_ROLE.DRIVER,
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
        payRate,
        // role: USER_ROLE.DRIVER,
        companyId: Number(companyId),
        role,
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
