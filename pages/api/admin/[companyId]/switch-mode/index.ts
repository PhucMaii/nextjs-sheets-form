import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { companyId } = req.query;
    const { mode } = req.body;
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await prisma.employee.findUnique({
      where: {
        id: Number(session.user.id),
        companyId: Number(companyId),
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await prisma.employee.update({
      where: {
        id: user.id,
      },
      data: {
        dashboardMode: mode,
      },
    });

    return res.status(200).json({
      data: updatedUser,
      message: 'Mode switched successfully',
    });
    
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
