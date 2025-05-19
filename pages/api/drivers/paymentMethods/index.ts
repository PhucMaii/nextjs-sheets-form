import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const session: any = await getServerSession(req, res, authOptions);

    if (!session?.user || !session?.user?.companyId) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        companyId: session?.user?.companyId,
      },
    });

    return res.status(200).json({
      data: paymentMethods,
      message: 'Fetch Payment Methods Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withDriverAuthGuard(handler);
