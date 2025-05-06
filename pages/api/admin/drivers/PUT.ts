import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  employeeId: number;
  hourlyRate: number;
  updatedName: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { employeeId, hourlyRate, updatedName }: IBody = req.body;

    if (!employeeId || !updatedName) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        error: 'Employee Not Found',
      });
    }

    const sameEmployeeName = await prisma.employee.findFirst({
      where: {
        name: updatedName,
        id: {
          not: employeeId,
        },
      },
    });

    if (sameEmployeeName) {
      return res.status(400).json({
        error: 'Employee Name Existed Already',
      });
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        name: updatedName,
        hourlyRate,
      },
    });

    return res.status(200).json({
      data: updatedEmployee,
      message: 'Update Employee Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
