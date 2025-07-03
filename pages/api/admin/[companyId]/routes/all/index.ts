import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import prisma from '@/client';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required',
      });
    }
    const routes = await prisma.route.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        clients: {
          include: {
            user: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json({ data: routes, message: 'Fetch Routes Successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
