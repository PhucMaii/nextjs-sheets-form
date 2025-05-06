import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Employee Id Not Provided',
      });
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!employee) {
      return res.status(500).json({
        error: 'Employee Not Found',
      });
    }

    return res.status(200).json({
      data: employee,
      message: 'Fetch Employee Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
