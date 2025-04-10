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

    const driverData: any = await getDriverInfo(req, res);

    const existingDriver = await prisma.driver.findUnique({
      where: {
        id: driverData.id,
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }

    await prisma.driver.update({
      where: {
        id: existingDriver.id,
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
