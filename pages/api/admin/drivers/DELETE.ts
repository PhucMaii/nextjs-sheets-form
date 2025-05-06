import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  employeeId?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { employeeId }: IQuery = req.query;

    if (!employeeId) {
      return res.status(404).json({
        error: 'You are missing employee id',
      });
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: Number(employeeId),
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        error: 'Employee Not Found',
      });
    }

    await prisma.employee.delete({
      where: {
        id: existingEmployee.id,
      },
    });

    return res.status(200).json({
      message: 'Delete Employee Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
