import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';
import { getDriverInfo } from '../../utils/auth';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { notiJson } = req.body;

    if (!notiJson) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const employeeData: any = await getDriverInfo(req, res);

    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: employeeData.id,
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        error: 'Employee Not Found',
      });
    }

    await prisma.employee.update({
      where: {
        id: existingEmployee.id,
      },
      data: {
        notification: notiJson,
      },
    });

    return res.status(200).json({
      message: 'Save Notification Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withDriverAuthGuard(handler);
