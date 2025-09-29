import prisma from '@/client';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const { id } = req.query as IQuery;

    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
      include: {
        clients: {
            include: {
                user: true,
            },
        },
      },
    });

    return res.status(200).json({
      data: route,
      message: 'Fetch Route Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withDriverAuthGuard(handler);
